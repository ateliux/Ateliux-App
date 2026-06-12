import { siteRoutes } from "../../data/siteRoutes";

export const headerContent = {
  logo: {
    src: "https://res.cloudinary.com/df4wjugxk/image/upload/v1773012361/Ateliux_Logo_hqmffn.png",
    alt: "Ateliux Logo",
  },
  login: {
    label: "Login",
    href: siteRoutes.login,
  },
  cta: {
    label: "Criar conta",
    href: siteRoutes.register,
  },
} as const;
