import { siteRoutes } from "./siteRoutes";

export const legalNavigation = [
  {
    id: "terms",
    label: "Termos",
    href: siteRoutes.terms,
  },
  {
    id: "privacy",
    label: "Privacidade",
    href: siteRoutes.privacy,
  },
] as const;
