import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogPostStatus } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateBlogPostDto } from './dto/create-blog-post.dto';
import type { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  findPublished() {
    return this.cache.remember('blog:published', 60, () =>
      this.prisma.blogPost.findMany({
        where: { status: BlogPostStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, coverFile: true },
      }),
    );
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: BlogPostStatus.PUBLISHED },
      include: { category: true, coverFile: true },
    });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }

  categories() {
    return this.cache.remember('blog:categories', 300, () =>
      this.prisma.blogCategory.findMany({ orderBy: { name: 'asc' } }),
    );
  }

  adminAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, author: { include: { user: true } } },
    });
  }

  create(user: RequestUser, dto: CreateBlogPostDto) {
    return this.prisma.blogPost.create({
      data: {
        ...dto,
        authorId: user.adminUserId,
        publishedAt: dto.status === BlogPostStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    await this.ensureExists(id);
    await this.cache.del('blog:published');
    return this.prisma.blogPost.update({ where: { id }, data: dto });
  }

  publish(id: string) {
    return this.setStatus(id, BlogPostStatus.PUBLISHED, true);
  }

  unpublish(id: string) {
    return this.setStatus(id, BlogPostStatus.DRAFT);
  }

  archive(id: string) {
    return this.setStatus(id, BlogPostStatus.ARCHIVED);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.cache.del('blog:published');
    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true };
  }

  private async setStatus(id: string, status: BlogPostStatus, publish = false) {
    await this.ensureExists(id);
    await this.cache.del('blog:published');
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        status,
        publishedAt: publish ? new Date() : undefined,
      },
    });
  }

  private async ensureExists(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }
}
