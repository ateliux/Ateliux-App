import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  BookOpenText,
  CircleUserRound,
  Home,
  LayoutGrid,
} from "lucide-react";

import { siteRoutes } from "./siteRoutes";

export type MobileNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mobileNavigation: MobileNavigationItem[] = [
  {
    label: "Home",
    href: siteRoutes.home,
    icon: Home,
  },
  {
    label: "Cases",
    href: siteRoutes.useCases,
    icon: LayoutGrid,
  },
  {
    label: "Preços",
    href: siteRoutes.pricing,
    icon: BadgeDollarSign,
  },
  {
    label: "Blog",
    href: siteRoutes.blog,
    icon: BookOpenText,
  },
  {
    label: "Sobre",
    href: siteRoutes.about,
    icon: CircleUserRound,
  },
];
