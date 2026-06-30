/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BlogPostStatus,
  InboxChannel,
  InboxSource,
  Priority,
  UserRole,
} from '@prisma/client';
import { BlogService } from './blog.service';
import type { CacheService } from '../cache/cache.service';
import type { RequestUser } from '../common/utils/request-user';
import type { FilesService } from '../files/files.service';
import type { PrismaService } from '../prisma/prisma.service';

const clientUser: RequestUser = {
  id: 'user-client',
  email: 'cliente@ateliux.test',
  role: UserRole.CLIENT,
  clientId: 'client-1',
};

const adminUser: RequestUser = {
  id: 'user-admin',
  email: 'admin@ateliux.test',
  role: UserRole.ADMIN,
  adminUserId: 'admin-1',
};

function publicPostFixture() {
  return {
    id: 'post-1',
    categoryId: 'tag-1',
    coverFileId: 'cover-1',
    heroImageFileId: 'hero-1',
    title: 'Artigo real',
    slug: 'artigo-real',
    excerpt: 'Resumo real',
    content: 'Conteudo real publicado',
    status: BlogPostStatus.PUBLISHED,
    readTime: '4 min',
    publishedAt: new Date('2026-06-27T12:00:00.000Z'),
    scheduledAt: null,
    category: { id: 'tag-1', name: 'Produto', slug: 'produto' },
    coverFile: {
      id: 'cover-1',
      secureUrl: 'https://res.cloudinary.com/demo/blog-cover.png',
      url: 'https://res.cloudinary.com/demo/blog-cover.png',
      originalName: 'blog-cover.png',
    },
    heroImageFile: {
      id: 'hero-1',
      secureUrl: 'https://res.cloudinary.com/demo/blog-hero.png',
      url: 'https://res.cloudinary.com/demo/blog-hero.png',
      originalName: 'blog-hero.png',
    },
    insightTitle: null,
    insightDescription: null,
    insightCtaLabel: null,
    insightCtaHref: null,
    contextTitle: null,
    contextContent: null,
    practicalTitle: null,
    practicalContent: null,
    seoTitle: null,
    seoDescription: null,
    _count: { comments: 0, shares: 0 },
  };
}

function createService() {
  const savedUpserts: unknown[] = [];
  const commentsCreated: unknown[] = [];
  const sharesCreated: unknown[] = [];
  const conversationsCreated: unknown[] = [];
  let deletedTag = '';

  const prisma = {
    blogPost: {
      findUnique: async ({ where }: { where: { id: string } }) => ({ id: where.id, categoryId: 'tag-1', title: 'Artigo real' }),
      findFirst: async ({ where }: { where: { id?: string; slug?: string } }) => ({
        ...publicPostFixture(),
        id: where.id ?? 'post-1',
        slug: where.slug ?? 'artigo-real',
      }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'post-1', ...data }),
      create: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'post-1', ...data }),
      delete: async () => ({ id: 'post-1' }),
      findMany: async () => [publicPostFixture()],
      count: async () => 0,
    },
    blogCategory: {
      findUnique: async ({ where }: { where: { id: string } }) => ({ id: where.id, name: 'Produto', slug: 'produto' }),
      delete: async ({ where }: { where: { id: string } }) => {
        deletedTag = where.id;
        return { id: where.id };
      },
      create: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'tag-2', ...data }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'tag-1', ...data }),
      findMany: async () => [],
    },
    savedBlogPost: {
      findMany: async () => [],
      findUnique: async () => null,
      upsert: async (input: unknown) => {
        savedUpserts.push(input);
        return input;
      },
      deleteMany: async () => ({ count: 1 }),
    },
    blogComment: {
      create: async (input: unknown) => {
        commentsCreated.push(input);
        return input;
      },
      findMany: async () => [],
      findUnique: async () => ({ id: 'comment-1' }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'comment-1', ...data }),
    },
    blogShare: {
      create: async (input: unknown) => {
        sharesCreated.push(input);
        return { id: 'share-1' };
      },
      count: async () => sharesCreated.length,
    },
    inboxConversation: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        conversationsCreated.push(data);
        return { id: 'conversation-1', ...data };
      },
    },
  } as unknown as PrismaService;

  const cache = {
    remember: async (_key: string, _ttl: number, factory: () => Promise<unknown>) => factory(),
    del: async () => undefined,
  } as unknown as CacheService;

  const files = {
    getFileUsage: async () => ({
      usedByBlogPosts: 0,
      usedByInboxMessages: 0,
      usedByRequests: 0,
      usedBySupportTickets: 0,
      usedByPreviews: 0,
      usedByFinanceRecords: 0,
    }),
    remove: async () => ({ success: true }),
  } as unknown as FilesService;

  return {
    service: new BlogService(prisma, cache, files),
    savedUpserts,
    commentsCreated,
    sharesCreated,
    conversationsCreated,
    getDeletedTag: () => deletedTag,
  };
}

describe('BlogService editorial flow', () => {
  it('retorna autor publico fixo e imagens reais no blog publico', async () => {
    const { service } = createService();

    const posts = await service.findPublished();
    const post = posts[0] as Record<string, unknown>;

    assert.equal(post.authorDisplayName, 'Equipe Ateliux');
    assert.equal(post.coverImageUrl, 'https://res.cloudinary.com/demo/blog-cover.png');
    assert.equal(post.heroImageUrl, 'https://res.cloudinary.com/demo/blog-hero.png');
    assert.equal('author' in post, false);
  });

  it('bloqueia publicacao sem tag principal', async () => {
    const { service } = createService();

    await assert.rejects(
      () =>
        service.create(adminUser, {
          title: 'Artigo',
          slug: 'artigo',
          content: 'Conteudo valido',
          status: BlogPostStatus.PUBLISHED,
        }),
      /Tag principal obrigatoria/,
    );
  });

  it('salva artigo publicado para o cliente autenticado', async () => {
    const { service, savedUpserts } = createService();

    const result = await service.save(clientUser, 'post-1');

    assert.deepEqual(result, { saved: true });
    assert.equal(savedUpserts.length, 1);
  });

  it('cria comentario real vinculado ao usuario cliente', async () => {
    const { service, commentsCreated } = createService();

    await service.createComment(clientUser, 'post-1', { body: ' Otimo artigo. ' });

    assert.equal(commentsCreated.length, 1);
    assert.match(JSON.stringify(commentsCreated[0]), /Otimo artigo/);
    assert.match(JSON.stringify(commentsCreated[0]), /user-client/);
  });

  it('registra compartilhamento publico do artigo', async () => {
    const { service, sharesCreated } = createService();

    const result = await service.share('post-1', { channel: 'web' });

    assert.equal(result.success, true);
    assert.equal(result.count, 1);
    assert.equal(sharesCreated.length, 1);
  });

  it('cria conversa no portal sobre artigo salvo', async () => {
    const { service, conversationsCreated } = createService();

    const result = await service.messageThread(clientUser, 'post-1');
    const created = conversationsCreated[0] as {
      channel: InboxChannel;
      source: InboxSource;
      priority: Priority;
      clientId: string;
      subject: string;
    };

    assert.equal(result.conversationId, 'conversation-1');
    assert.equal(created.clientId, 'client-1');
    assert.equal(created.channel, InboxChannel.CLIENTS);
    assert.equal(created.source, InboxSource.PORTAL_CLIENT);
    assert.equal(created.priority, Priority.MEDIUM);
    assert.match(created.subject, /Artigo real/);
  });
});
