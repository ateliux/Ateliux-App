import type { UseCaseCategoryId } from "./useCasesNavigation";

export const siteRoutes = {
  home: "/inicio",
  useCases: "/use-cases",
  pricing: "/precos",
  blog: "/blog",
  about: "/sobre",
  faq: "/faq",
  support: "/suporte",
  design: "/design",
  contact: "/contato",
  terms: "/termos",
  privacy: "/privacidade",
  login: "/login",
  register: "/criar-conta",
  clientPortal: "/cliente/visao-geral",
} as const;

export function contactRoute(params?: { plan?: string; subject?: string }) {
  const searchParams = new URLSearchParams();

  if (params?.plan) searchParams.set("plano", params.plan);
  if (params?.subject) searchParams.set("assunto", params.subject);

  const query = searchParams.toString();
  return query ? `${siteRoutes.contact}?${query}` : siteRoutes.contact;
}

export function buildUseCaseRoute(params?: {
  category?: UseCaseCategoryId;
  module?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set("category", params.category);
  if (params?.module) searchParams.set("module", params.module);

  const query = searchParams.toString();
  return query ? `${siteRoutes.useCases}?${query}` : siteRoutes.useCases;
}

export function blogPostRoute(slug: string) {
  return `${siteRoutes.blog}/${slug}`;
}
