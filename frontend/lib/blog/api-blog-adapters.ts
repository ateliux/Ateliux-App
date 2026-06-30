import type { BlogArticle, BlogArtworkName, BlogPost } from "@/content/blog";
import { blogArticles } from "@/content/blog";
import type { BlogPostDto } from "@/services/blog.service";

const artworks: BlogArtworkName[] = ["hero", "pixels", "yellowShapes", "circles", "softSystem", "gradient", "lines"];

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Sem data"
    : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function artworkFor(index: number): BlogArtworkName {
  return artworks[index % artworks.length];
}

function tagFor(post: BlogPostDto) {
  return post.tag?.name ?? post.category?.name ?? "Ateliux";
}

function fileUrl(file?: BlogPostDto["coverFile"] | BlogPostDto["heroImageFile"] | null, directUrl?: string | null) {
  return directUrl ?? file?.secureUrl ?? file?.url ?? "";
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? "";
}

export function toBlogPost(post: BlogPostDto, index: number): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    tag: tagFor(post),
    date: formatDate(post.publishedAt),
    title: post.title,
    description: post.excerpt ?? "Conteudo publicado pela Ateliux.",
    artwork: artworkFor(index),
    coverUrl: fileUrl(post.coverFile, post.coverImageUrl ?? post.coverUrl),
  };
}

function paragraphsFrom(value?: string | null) {
  return (value ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/^#+\s*/, "").trim())
    .filter(Boolean);
}

function bodyFromPost(post: BlogPostDto) {
  const introParagraphs = paragraphsFrom(post.content);
  const body: Array<{ title?: string; paragraphs: string[] }> = [
    {
      paragraphs: introParagraphs.length ? introParagraphs.slice(0, 2) : ["Conteudo publicado pela Ateliux."],
    },
  ];

  const contextParagraphs = paragraphsFrom(post.contextContent);
  if (post.contextTitle || contextParagraphs.length) {
    body.push({
      title: post.contextTitle ?? "Contexto",
      paragraphs: contextParagraphs.length ? contextParagraphs : ["Este artigo foi carregado diretamente da API publica do blog."],
    });
  }

  const practicalParagraphs = paragraphsFrom(post.practicalContent);
  if (post.practicalTitle || practicalParagraphs.length) {
    body.push({
      title: post.practicalTitle ?? "Aplicacao pratica",
      paragraphs: practicalParagraphs.length ? practicalParagraphs : ["A proposta e conectar decisao, design e tecnologia em uma experiencia clara para o usuario."],
    });
  }

  const remainingParagraphs = introParagraphs.slice(2);
  if (remainingParagraphs.length) {
    body.push({
      title: "Detalhes",
      paragraphs: remainingParagraphs,
    });
  }

  return body;
}

export function toBlogArticle(post: BlogPostDto, allPosts: BlogPostDto[] = []): BlogArticle {
  const index = Math.max(0, allPosts.findIndex((item) => item.slug === post.slug));
  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const fallback = blogArticles[index % blogArticles.length] ?? blogArticles[0];
  const coverUrl = fileUrl(post.coverFile, post.coverImageUrl ?? post.coverUrl);
  const heroImage = fileUrl(post.heroImageFile, post.heroImageUrl) || coverUrl;

  return {
    ...toBlogPost(post, index),
    category: tagFor(post),
    subtitle: firstNonEmpty(post.excerpt, fallback.subtitle),
    author: post.authorDisplayName ?? "Equipe Ateliux",
    readTime: post.readTime ?? "5 min de leitura",
    shares: post._count?.shares ?? 0,
    comments: post._count?.comments ?? 0,
    heroImage: heroImage || undefined,
    heroAlt: post.title,
    body: bodyFromPost(post),
    sideNote: {
      eyebrow: "Insight Ateliux",
      title: firstNonEmpty(post.insightTitle, fallback.sideNote.title),
      description: firstNonEmpty(post.insightDescription, fallback.sideNote.description),
      ctaLabel: firstNonEmpty(post.insightCtaLabel, "Falar com a Ateliux"),
      ctaHref: firstNonEmpty(post.insightCtaHref),
    },
    relatedItems: related.map((item, relatedIndex) => ({
      slug: item.slug,
      title: item.title,
      description: item.excerpt ?? toBlogPost(item, relatedIndex).description,
    })),
    commentItems: [],
  };
}
