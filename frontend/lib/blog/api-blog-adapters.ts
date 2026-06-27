import type { BlogArticle, BlogArtworkName, BlogPost } from "@/content/blog";
import { blogArticles } from "@/content/blog";
import type { BlogPostDto } from "@/services/blog.service";

const artworks: BlogArtworkName[] = ["hero", "pixels", "yellowShapes", "circles", "softSystem", "gradient", "lines"];
const defaultHeroImage = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=85";

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sem data" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function artworkFor(index: number): BlogArtworkName {
  return artworks[index % artworks.length];
}

function tagFor(post: BlogPostDto) {
  return post.category?.name ?? "Ateliux";
}

export function toBlogPost(post: BlogPostDto, index: number): BlogPost {
  return {
    slug: post.slug,
    tag: tagFor(post),
    date: formatDate(post.publishedAt),
    title: post.title,
    description: post.excerpt ?? "Conteudo publicado pela Ateliux.",
    artwork: artworkFor(index),
  };
}

function bodyFromContent(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/^#+\s*/, "").trim())
    .filter(Boolean);

  return [
    {
      paragraphs: paragraphs.length ? paragraphs.slice(0, 2) : ["Conteudo publicado pela Ateliux."],
    },
    {
      title: "Contexto",
      paragraphs: paragraphs.slice(2, 4).length ? paragraphs.slice(2, 4) : ["Este artigo foi carregado diretamente da API publica do blog."],
    },
    {
      title: "Aplicacao pratica",
      paragraphs: paragraphs.slice(4, 6).length ? paragraphs.slice(4, 6) : ["A proposta e conectar decisao, design e tecnologia em uma experiencia clara para o usuario."],
    },
  ] as const;
}

export function toBlogArticle(post: BlogPostDto, allPosts: BlogPostDto[] = []): BlogArticle {
  const index = Math.max(0, allPosts.findIndex((item) => item.slug === post.slug));
  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const fallback = blogArticles[index % blogArticles.length] ?? blogArticles[0];

  return {
    ...toBlogPost(post, index),
    category: tagFor(post),
    subtitle: post.excerpt ?? fallback.subtitle,
    author: "Equipe Ateliux",
    readTime: post.readTime ?? "5 min de leitura",
    shares: fallback.shares,
    comments: 5,
    heroImage: defaultHeroImage,
    heroAlt: post.title,
    body: bodyFromContent(post.content),
    sideNote: fallback.sideNote,
    relatedItems: related.map((item, relatedIndex) => ({
      slug: item.slug,
      title: item.title,
      description: item.excerpt ?? toBlogPost(item, relatedIndex).description,
    })),
    inlineMedia: {
      artwork: artworkFor(index),
      title: "Da ideia a execucao",
      caption: "Conteudo conectado ao ecossistema Ateliux.",
    },
    commentItems: fallback.commentItems.slice(0, 5),
  };
}
