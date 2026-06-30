import { siteRoutes } from "../../data/siteRoutes";

export const designCareerContent = {
  rating: {
    score: "Visual direction",
    by: "design antes do código",
  },
  title: {
    beforeHighlight: "Projetamos a base visual",
    highlight: "antes",
    afterHighlight: "de transformar em software",
  },
  description:
    "Organizamos tipografia, cores, componentes e padrões visuais para que cada projeto nasça com clareza, consistência e pronto para evoluir.",
  ctaLabel: "Veja como Projetamos",
  ctaHref: siteRoutes.design,
  colorPalette: ["#5A81FA", "#20305F", "#2D334D", "#E4EBFF", "#FFFFFF"],
  taskTabs: {
    active: "Design",
    inactive: "Dev",
  },
  tasks: [
    {
      status: "ETAPA 01",
      statusClass: "bg-[#5A81FA]",
      name: "Direção visual",
      message: "Estilo, referências e experiência",
      time: "Guide",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=256&auto=format&fit=crop",
      alt: "Mesa com processo criativo de design visual",
      read: true,
      featured: false,
      grayscale: false,
    },
    {
      status: "ETAPA 02",
      statusClass: "bg-[#20305F]",
      name: "Tipografia e paleta",
      message: "Cores, contraste e hierarquia visual",
      time: "Style",
      image:
        "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=256&auto=format&fit=crop",
      alt: "Elementos visuais de cor e composição",
      read: false,
      featured: true,
      grayscale: false,
    },
    {
      status: "ETAPA 03",
      statusClass: "bg-[#0066FF]",
      name: "Livraria de Componentes",
      message: "Botões, cards, inputs e padrões reutilizáveis",
      time: "UI Kit",
      image:
        "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=256&auto=format&fit=crop",
      alt: "Interface digital com componentes de produto",
      read: false,
      featured: false,
      grayscale: true,
    },
  ],
  profile: {
    image:
      "https://res.cloudinary.com/df4wjugxk/image/upload/v1782776570/Ateliux_Logo_-_1_c5r2xx.png",
    alt: "Símbolo visual do Design System da Ateliux",
    badge: "ATELIUX",
    name: "Design System",
    username: "@ateliux.design",
    stats: [
      { value: "01", label: "Tipo" },
      { value: "02", label: "Cores" },
      { value: "03", label: "UI Kit" },
    ],
    skills: [
      { label: "Guia de Estilo Definido", checked: true, opacity: "opacity-100" },
      { label: "Paleta Consistente", checked: true, opacity: "opacity-60" },
      { label: "Componentes Prontos", checked: false, opacity: "opacity-40" },
    ],
  },
  alignmentActive: "UI",
  alignmentSizes: ["UX", "UI", "KIT", "DEV"],
  leads: [
    {
      name: "Guia de Estilo",
      description: "Tipografia, cores e hierarquia",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=256&auto=format&fit=crop",
      alt: "Guia visual com direção de estilo",
      liked: true,
    },
    {
      name: "Livraria de Componentes",
      description: "Elementos reutilizáveis para escala",
      image:
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=256&auto=format&fit=crop",
      alt: "Biblioteca de componentes digitais",
      liked: false,
    },
  ],
  slider: {
    active: "UI",
    inactive: "DEV",
    percentage: "100%",
  },
  signoff: "antes do código, criamos a base visual que sustenta o produto.",
} as const;
