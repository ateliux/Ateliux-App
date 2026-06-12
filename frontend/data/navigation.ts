import { siteRoutes } from "./siteRoutes";

export const mainNavigation = [
  {
    label: "Home",
    href: siteRoutes.home,
  },
  {
    label: "Use cases",
    href: siteRoutes.useCases,
  },
  {
    label: "Preços",
    href: siteRoutes.pricing,
  },
  {
    label: "Blog",
    href: siteRoutes.blog,
  },
  {
    label: "Sobre",
    href: siteRoutes.about,
  },
] as const;

export const socialNavigation = [
  {
    label: "Twitter",
    href: "#",
  },
  {
    label: "Instagram",
    href: "#",
  },
  {
    label: "LinkedIn",
    href: "#",
  },
] as const;

export const legalNavigation = [
  {
    label: "Termos e Condições",
    href: siteRoutes.terms,
  },
  {
    label: "Privacidade",
    href: siteRoutes.privacy,
  },
] as const;
