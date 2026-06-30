import { siteRoutes } from "./siteRoutes";

export const legalNavigation = [
  {
    id: "terms",
    label: "Termos de Uso",
    href: siteRoutes.terms,
  },
  {
    id: "portalTerms",
    label: "Termos do Portal",
    href: siteRoutes.portalTerms,
  },
  {
    id: "privacy",
    label: "Privacidade",
    href: siteRoutes.privacy,
  },
  {
    id: "cookies",
    label: "Cookies",
    href: siteRoutes.cookiePolicy,
  },
  {
    id: "lgpd",
    label: "LGPD",
    href: siteRoutes.lgpd,
  },
] as const;
