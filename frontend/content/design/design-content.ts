import { contactRoute, siteRoutes } from "../../data/siteRoutes";

export const designContent = {
  hero: {
    badge: "Sistema visual Ateliux",
    title: "Guia de Estilos",
    description:
      "Esta página documenta a base visual criada para o site da Ateliux: páginas institucionais clean, cards leves, botões pretos, contrastes suaves, acentos técnicos em azul e uma experiência editorial dark dedicada ao blog.",
  },
  typography: {
    title: "Tipografia & Hierarquia",
    description:
      "A base sans-serif prioriza leitura clara e hierarquia objetiva. Títulos fortes organizam cada seção, enquanto textos secundários em slate reduzem o peso visual e mantêm boa legibilidade em páginas comerciais, artigos e formulários.",
    fontName: "Sans-serif",
    alphabetLineOne: "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq",
    alphabetLineTwo: "Rr Ss Tt Uu Vv Ww Xx Yy Zz",
    weights: [
      {
        name: "Texto",
        className: "font-normal",
      },
      {
        name: "Interface",
        className: "font-medium",
      },
      {
        name: "Títulos",
        className: "font-bold",
      },
    ],
  },
  palette: {
    title: "Paleta do Projeto",
    description:
      "Preto e branco sustentam a identidade e os CTAs principais. Superfícies off-white e tons slate organizam páginas clean, o azul destaca módulos e elementos técnicos, e o blog usa superfícies escuras para criar uma leitura editorial própria.",
    schemeLabel: "Ateliux UI",
    primary: {
      label: "CTA / Preto",
      hex: "#000000",
    },
    colors: [
      {
        label: "Texto",
        hex: "#0F172A",
        textClass: "text-white",
      },
      {
        label: "Muted",
        hex: "#64748B",
        textClass: "text-white",
      },
      {
        label: "Surface",
        hex: "#FFFFFF",
        textClass: "text-slate-500",
        borderClass: "border-l border-t border-slate-100",
      },
      {
        label: "Soft",
        hex: "#F8FAFC",
        textClass: "text-slate-500",
        borderClass: "border-l border-t border-slate-100",
      },
      {
        label: "Blog dark",
        hex: "#121214",
        textClass: "text-white",
      },
      {
        label: "Accent",
        hex: "#3B82F6",
        textClass: "text-white",
      },
    ],
  },
  components: {
    title: "Biblioteca de Componentes",
    description:
      "A mesma lógica visual conecta navbar, CTAs, cards de preço, módulos de use cases, blog dark, inputs e formulários. A Ateliux não cria apenas telas bonitas: constrói um sistema consistente para sustentar software real e suas próximas evoluções.",
    buttons: [
      {
        label: "Criar projeto",
        href: contactRoute({ subject: "criar-projeto" }),
        className:
          "w-full rounded-lg bg-black py-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4",
      },
      {
        label: "Solicitar orçamento",
        href: contactRoute({ subject: "orcamento" }),
        className:
          "w-full rounded-lg border border-black bg-white py-4 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4",
      },
      {
        label: "Ver use case",
        href: siteRoutes.useCases,
        className:
          "w-full rounded-lg bg-[#F8FAFC] py-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4",
      },
      {
        label: "Entrar com Google",
        href: siteRoutes.login,
        icon: "google",
        className:
          "mt-2 flex w-full items-center justify-center gap-3 rounded-lg bg-[#1A1B1E] py-4 text-sm font-medium text-white transition-colors hover:bg-[#25262A] focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4",
      },
    ],
  },
} as const;
