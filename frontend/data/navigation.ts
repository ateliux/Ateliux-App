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
    label: "Precos",
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
    label: "X",
    href: "https://x.com/ateliux",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ateliux/",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61586258123612",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ateliux-company/",
  },
] as const;

export const legalNavigation = [
  {
    label: "Politica de Privacidade",
    href: siteRoutes.privacy,
  },
  {
    label: "Politica de Cookies",
    href: siteRoutes.cookiePolicy,
  },
  {
    label: "Termos de Uso",
    href: siteRoutes.terms,
  },
  {
    label: "LGPD",
    href: siteRoutes.lgpd,
  },
] as const;
