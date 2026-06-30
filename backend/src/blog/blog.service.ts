import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BlogCommentStatus, BlogPostStatus, InboxChannel, InboxSource, Prisma, Priority } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { FilesService } from '../files/files.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import type { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import type { CreateBlogPostDto } from './dto/create-blog-post.dto';
import type { ShareBlogPostDto } from './dto/share-blog-post.dto';
import type { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import type { UpdateBlogPostDto } from './dto/update-blog-post.dto';

const publicPostInclude = {
  category: true,
  coverFile: {
    select: {
      id: true,
      secureUrl: true,
      url: true,
      originalName: true,
    },
  },
  heroImageFile: {
    select: {
      id: true,
      secureUrl: true,
      url: true,
      originalName: true,
    },
  },
  _count: { select: { comments: true, shares: true } },
} as const;

const adminPostInclude = {
  category: true,
  coverFile: true,
  heroImageFile: true,
  author: { include: { user: true } },
  _count: { select: { comments: true, savedBy: true, shares: true } },
} as const;

type PublicPostRecord = Prisma.BlogPostGetPayload<{ include: typeof publicPostInclude }> & {
  savedAt?: Date | string | null;
};

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly files: FilesService,
  ) {}

  async findPublished() {
    const posts = await this.cache.remember('blog:published', 60, () =>
      this.prisma.blogPost.findMany({
        where: { status: BlogPostStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        include: publicPostInclude,
      }),
    );
    return posts.map((post) => toPublicPost(post));
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: BlogPostStatus.PUBLISHED },
      include: publicPostInclude,
    });
    if (!post) throw new NotFoundException('Blog post not found.');
    return toPublicPost(post);
  }

  categories() {
    return this.cache.remember('blog:categories', 300, () =>
      this.prisma.blogCategory.findMany({ orderBy: { name: 'asc' } }),
    );
  }

  tags() {
    return this.categories();
  }

  adminAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: adminPostInclude,
    });
  }

  async adminOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: adminPostInclude,
    });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }

  async create(user: RequestUser, dto: CreateBlogPostDto) {
    if (!user.adminUserId) throw new BadRequestException('Administrador autenticado obrigatorio.');
    this.assertPublishable(dto.status, dto.categoryId);
    const data = {
      ...this.toPostData(dto),
      authorId: user.adminUserId,
      publishedAt: dto.status === BlogPostStatus.PUBLISHED ? new Date() : undefined,
    } as Prisma.BlogPostUncheckedCreateInput;

    const post = await this.prisma.blogPost.create({
      data,
      include: adminPostInclude,
    });
    await this.invalidateBlogCache();
    return post;
  }

  async update(id: string, user: RequestUser, dto: UpdateBlogPostDto) {
    const current = await this.ensureExists(id);
    this.assertPublishable(dto.status, dto.categoryId ?? current.categoryId);
    const previousFileIds = [current.coverFileId, current.heroImageFileId].filter(Boolean) as string[];

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: this.toPostData(dto),
      include: adminPostInclude,
    });
    await this.invalidateBlogCache();
    await this.cleanupOldBlogFiles(previousFileIds, [post.coverFileId, post.heroImageFileId], user);
    return post;
  }

  async publish(id: string) {
    const post = await this.ensureExists(id);
    this.assertPublishable(BlogPostStatus.PUBLISHED, post.categoryId);
    return this.setStatus(id, BlogPostStatus.PUBLISHED, true);
  }

  unpublish(id: string) {
    return this.setStatus(id, BlogPostStatus.DRAFT);
  }

  archive(id: string) {
    return this.setStatus(id, BlogPostStatus.ARCHIVED);
  }

  async remove(id: string, user: RequestUser) {
    const post = await this.ensureExists(id);
    const previousFileIds = [post.coverFileId, post.heroImageFileId].filter(Boolean) as string[];
    await this.prisma.blogPost.delete({ where: { id } });
    await this.invalidateBlogCache();
    await this.cleanupOldBlogFiles(previousFileIds, [], user);
    return { success: true };
  }

  async createTag(dto: CreateBlogCategoryDto) {
    const tag = await this.prisma.blogCategory.create({
      data: {
        name: dto.name.trim(),
        slug: dto.slug.trim(),
      },
    });
    await this.cache.del('blog:categories');
    return tag;
  }

  async updateTag(id: string, dto: UpdateBlogCategoryDto) {
    await this.ensureTagExists(id);
    const tag = await this.prisma.blogCategory.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        slug: dto.slug?.trim(),
      },
    });
    await this.invalidateBlogCache();
    return tag;
  }

  async deleteTag(id: string) {
    await this.ensureTagExists(id);
    const postsUsingTag = await this.prisma.blogPost.count({ where: { categoryId: id } });
    if (postsUsingTag > 0) {
      throw new BadRequestException('Tag em uso por artigos. Remova a tag dos artigos antes de excluir.');
    }
    await this.prisma.blogCategory.delete({ where: { id } });
    await this.cache.del('blog:categories');
    return { success: true };
  }

  async publishedComments(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: BlogPostStatus.PUBLISHED },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Blog post not found.');
    return this.commentsForPost(post.id, false);
  }

  async adminComments(postId: string) {
    await this.ensureExists(postId);
    return this.commentsForPost(postId, true);
  }

  async createComment(user: RequestUser, postId: string, dto: CreateBlogCommentDto) {
    const body = dto.body.trim();
    if (!body) throw new BadRequestException('Comentario obrigatorio.');

    await this.ensurePublishedById(postId);
    return this.prisma.blogComment.create({
      data: {
        postId,
        userId: user.id,
        body,
      },
      include: commentInclude(),
    });
  }

  async deleteComment(id: string) {
    const comment = await this.prisma.blogComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found.');
    return this.prisma.blogComment.update({
      where: { id },
      data: {
        status: BlogCommentStatus.DELETED,
        deletedAt: new Date(),
      },
      include: commentInclude(),
    });
  }

  async saved(user: RequestUser) {
    const rows = await this.prisma.savedBlogPost.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: publicPostInclude,
        },
      },
    });
    return rows.map((row) => toPublicPost({ ...row.post, savedAt: row.createdAt }));
  }

  async savedStatus(user: RequestUser, postId: string) {
    await this.ensurePublishedById(postId);
    const saved = await this.prisma.savedBlogPost.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });
    return { saved: Boolean(saved) };
  }

  async save(user: RequestUser, postId: string) {
    await this.ensurePublishedById(postId);
    await this.prisma.savedBlogPost.upsert({
      where: { userId_postId: { userId: user.id, postId } },
      create: { userId: user.id, postId },
      update: {},
    });
    return { saved: true };
  }

  async unsave(user: RequestUser, postId: string) {
    await this.ensurePublishedById(postId);
    await this.prisma.savedBlogPost.deleteMany({ where: { userId: user.id, postId } });
    return { saved: false };
  }

  async share(postId: string, dto: ShareBlogPostDto, user?: RequestUser) {
    await this.ensurePublishedById(postId);
    const share = await this.prisma.blogShare.create({
      data: {
        postId,
        userId: user?.id,
        channel: dto.channel?.trim() || 'web',
      },
    });
    const count = await this.prisma.blogShare.count({ where: { postId } });
    return { success: true, id: share.id, count };
  }

  async messageThread(user: RequestUser, postId: string) {
    if (!user.clientId) throw new BadRequestException('Cliente autenticado obrigatorio.');
    const post = await this.ensurePublishedById(postId);
    const subject = `Comentario sobre o artigo: ${post.title}`;

    const conversation = await this.prisma.inboxConversation.create({
      data: {
        clientId: user.clientId,
        channel: InboxChannel.CLIENTS,
        source: InboxSource.PORTAL_CLIENT,
        priority: Priority.MEDIUM,
        subject,
        preview: `O cliente quer falar sobre este artigo: ${post.title}`,
        messages: {
          create: {
            senderType: 'system',
            body: `O cliente quer falar sobre este artigo: ${post.title}`,
          },
        },
      },
    });

    return {
      conversationId: conversation.id,
      href: `/cliente/suporte?conversationId=${conversation.id}&blogPostId=${post.id}`,
      subject,
    };
  }

  private async setStatus(id: string, status: BlogPostStatus, publish = false) {
    await this.ensureExists(id);
    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        status,
        publishedAt: publish ? new Date() : undefined,
      },
      include: adminPostInclude,
    });
    await this.invalidateBlogCache();
    return post;
  }

  private async ensureExists(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }

  private async ensurePublishedById(id: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { id, status: BlogPostStatus.PUBLISHED },
    });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }

  private async ensureTagExists(id: string) {
    const tag = await this.prisma.blogCategory.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Blog tag not found.');
    return tag;
  }

  private assertPublishable(status: BlogPostStatus | undefined, categoryId: string | undefined | null) {
    if (status === BlogPostStatus.PUBLISHED && !categoryId) {
      throw new BadRequestException('Tag principal obrigatoria para publicar artigo.');
    }
  }

  private toPostData(dto: CreateBlogPostDto | UpdateBlogPostDto): Prisma.BlogPostUncheckedUpdateInput {
    return {
      categoryId: emptyToNull(dto.categoryId),
      coverFileId: emptyToNull(dto.coverFileId),
      heroImageFileId: emptyToNull(dto.heroImageFileId),
      title: dto.title?.trim(),
      slug: dto.slug?.trim(),
      excerpt: emptyToNull(dto.excerpt),
      content: dto.content?.trim(),
      status: dto.status,
      readTime: emptyToNull(dto.readTime),
      insightTitle: emptyToNull(dto.insightTitle),
      insightDescription: emptyToNull(dto.insightDescription),
      insightCtaLabel: emptyToNull(dto.insightCtaLabel),
      insightCtaHref: emptyToNull(dto.insightCtaHref),
      contextTitle: emptyToNull(dto.contextTitle),
      contextContent: emptyToNull(dto.contextContent),
      practicalTitle: emptyToNull(dto.practicalTitle),
      practicalContent: emptyToNull(dto.practicalContent),
      seoTitle: emptyToNull(dto.seoTitle),
      seoDescription: emptyToNull(dto.seoDescription),
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    };
  }

  private async commentsForPost(postId: string, includeDeleted: boolean) {
    return this.prisma.blogComment.findMany({
      where: {
        postId,
        ...(includeDeleted ? {} : { status: BlogCommentStatus.PUBLISHED, deletedAt: null }),
      },
      orderBy: { createdAt: 'desc' },
      include: commentInclude(),
    });
  }

  private async invalidateBlogCache() {
    await Promise.all([this.cache.del('blog:published'), this.cache.del('blog:categories')]);
  }

  private async cleanupOldBlogFiles(previousFileIds: string[], currentFileIds: Array<string | null>, user: RequestUser) {
    const current = new Set(currentFileIds.filter(Boolean));
    const staleIds = [...new Set(previousFileIds)].filter((fileId) => !current.has(fileId));

    await Promise.all(
      staleIds.map(async (fileId) => {
        try {
          const usage = await this.files.getFileUsage(fileId);
          if (usage.usedByBlogPosts > 0) return;
          await this.files.remove(fileId, user);
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'unknown';
          this.logger.warn(`Blog image cleanup skipped. fileId=${fileId} reason=${reason}`);
        }
      }),
    );
  }
}

function commentInclude() {
  return {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        clientAccount: { include: { client: true } },
      },
    },
  } as const;
}

function emptyToNull(value: string | undefined | null) {
  if (value === undefined) return undefined;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function publicFile(file: PublicPostRecord['coverFile']) {
  if (!file) return null;
  return {
    id: file.id,
    secureUrl: file.secureUrl,
    url: file.url,
    originalName: file.originalName,
  };
}

function publicImageUrl(file: PublicPostRecord['coverFile']) {
  return file?.secureUrl ?? file?.url ?? null;
}

function toPublicPost(post: PublicPostRecord) {
  const coverFile = publicFile(post.coverFile);
  const heroImageFile = publicFile(post.heroImageFile);
  const coverImageUrl = publicImageUrl(post.coverFile);
  const heroImageUrl = publicImageUrl(post.heroImageFile) ?? coverImageUrl;

  return {
    id: post.id,
    categoryId: post.categoryId,
    coverFileId: post.coverFileId,
    heroImageFileId: post.heroImageFileId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    readTime: post.readTime,
    publishedAt: post.publishedAt,
    scheduledAt: post.scheduledAt,
    category: post.category,
    tag: post.category,
    coverFile,
    heroImageFile,
    coverUrl: coverImageUrl,
    coverImageUrl,
    heroImageUrl,
    authorDisplayName: 'Equipe Ateliux',
    insightTitle: post.insightTitle,
    insightDescription: post.insightDescription,
    insightCtaLabel: post.insightCtaLabel,
    insightCtaHref: post.insightCtaHref,
    contextTitle: post.contextTitle,
    contextContent: post.contextContent,
    practicalTitle: post.practicalTitle,
    practicalContent: post.practicalContent,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    savedAt: post.savedAt,
    _count: post._count,
  };
}
