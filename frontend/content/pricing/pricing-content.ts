import { contactRoute } from "../../data/siteRoutes";

export const pricingPlanIds = ["essential", "pro", "enterprise"] as const;

export type PricingPlanId = (typeof pricingPlanIds)[number];
export type BillingCycleId = "monthly" | "yearly";

export type PricingPrice = {
  value: string;
  period: string;
  detail?: string;
};

export type PricingPlan = {
  id: PricingPlanId;
  eyebrow: string;
  name: string;
  description: string;
  recommended?: boolean;
  pricing: Record<BillingCycleId, PricingPrice>;
  features: readonly string[];
  cta: {
    label: string;
    href: string;
  };
};

type ComparisonValue = string | boolean;

type ComparisonFeature = {
  name: string;
  values: Record<PricingPlanId, ComparisonValue>;
};

export const pricingContent = {
  hero: {
    badge: "Preços",
    title: "Planos para transformar sua ideia em um produto digital real.",
    description:
      "Escolha o ponto de partida ideal para criar sites, landing pages, e-commerce, SaaS, dashboards e ecossistemas digitais com design, código e estratégia.",
  },
  selector: {
    eyebrow: "Escolha seu plano",
    title: "Comece do tamanho certo.",
    description:
      "Os valores abaixo servem como base inicial. Projetos sob medida podem variar conforme escopo, integrações e nível de complexidade.",
  },
  billingCycles: [
    {
      id: "monthly",
      label: "Pagamento mensal",
    },
    {
      id: "yearly",
      label: "Pagamento anual",
      badge: "Economize",
    },
  ] as const satisfies readonly {
    id: BillingCycleId;
    label: string;
    badge?: string;
  }[],

  faq: {
  title: "Dúvidas sobre os planos.",
  description:
    "Entenda como funcionam os valores, escopos e próximos passos antes de iniciar seu projeto com a Ateliux.",
  items: [
    {
      question: "Os planos têm valores fixos?",
      answer:
        "Os valores servem como base inicial para orientar o investimento. Cada projeto pode variar conforme quantidade de páginas, integrações, backend, dashboard, automações e nível de complexidade.",
    },
    {
      question: "Posso começar com um plano menor e evoluir depois?",
      answer:
        "Sim. A estrutura pode começar com uma landing page, site ou MVP e evoluir para e-commerce, SaaS, dashboard administrativo ou ecossistema completo conforme o negócio amadurece.",
    },
    {
      question: "A Ateliux também cuida do design?",
      answer:
        "Sim. Criamos o design UI/UX, organizamos a experiência do usuário, definimos componentes visuais e entregamos uma base pensada para virar código com qualidade.",
    },
    {
      question: "O backend está incluso em todos os planos?",
      answer:
        "No plano Essencial, o foco é presença digital e front-end. Backend, APIs, banco de dados e dashboards entram nos planos Profissional ou Enterprise, dependendo do escopo.",
    },
    {
      question: "Como começa o processo do projeto?",
      answer:
        "O primeiro passo é um diagnóstico rápido para entender objetivo, público, funcionalidades, prazo e nível de complexidade. Depois disso, organizamos o escopo e a melhor rota de execução.",
    },
  ],
},

  plans: [
    {
      id: "essential",
      eyebrow: "Para começar",
      name: "Essencial",
      description:
        "Ideal para negócios que precisam validar presença digital com uma base profissional e bem construída.",
      pricing: {
        monthly: {
          value: "R$ 1.490",
          period: "/mês",
          detail: "Base para sites e landing pages.",
        },
        yearly: {
          value: "R$ 14.900",
          period: "/ano",
          detail: "Planejamento anual com prioridade evolutiva.",
        },
      },
      features: [
        "Landing page ou site institucional",
        "Design responsivo",
        "SEO técnico inicial",
        "Publicação assistida",
      ],
      cta: {
        label: "Começar projeto",
        href: contactRoute({ plan: "essencial" }),
      },
    },
    {
      id: "pro",
      eyebrow: "Mais escolhido",
      name: "Profissional",
      description:
        "Para empresas que precisam de uma experiência digital completa com estrutura, integrações e evolução.",
      recommended: true,
      pricing: {
        monthly: {
          value: "R$ 3.900",
          period: "/mês",
          detail: "Base para e-commerce, dashboards e SaaS inicial.",
        },
        yearly: {
          value: "R$ 39.900",
          period: "/ano",
          detail: "Evolução contínua com roadmap dedicado.",
        },
      },
      features: [
        "E-commerce, dashboard ou SaaS inicial",
        "UI/UX sob medida",
        "Integrações com APIs",
        "Frontend pronto para escala",
      ],
      cta: {
        label: "Solicitar proposta",
        href: contactRoute({ plan: "profissional" }),
      },
    },
    {
      id: "enterprise",
      eyebrow: "Sob medida",
      name: "Enterprise",
      description:
        "Para projetos complexos, ecossistemas digitais, múltiplos módulos, integrações e operação em escala.",
      pricing: {
        monthly: {
          value: "Sob consulta",
          period: "",
          detail: "Escopo definido após diagnóstico técnico.",
        },
        yearly: {
          value: "Sob consulta",
          period: "",
          detail: "Contrato estratégico para evolução contínua.",
        },
      },
      features: [
        "Arquitetura personalizada",
        "Backend e banco de dados",
        "Dashboards administrativos",
        "Integrações e automações",
      ],
      cta: {
        label: "Agendar diagnóstico",
        href: contactRoute({ plan: "enterprise" }),
      },
    },
  ] as const satisfies readonly PricingPlan[],
  comparison: {
    eyebrow: "Comparativo",
    title: "Compare o que cada plano pode incluir.",
    description:
      "Use a tabela como referência para entender o nível de entrega. O escopo final é ajustado conforme o projeto.",
    features: [
      {
        name: "Tipo de projeto",
        values: {
          essential: "Site ou landing page",
          pro: "E-commerce, SaaS ou dashboard",
          enterprise: "Ecossistema sob medida",
        },
      },
      {
        name: "Páginas ou fluxos",
        values: {
          essential: "Até 5",
          pro: "Até 15",
          enterprise: "Personalizado",
        },
      },
      {
        name: "Design UI/UX",
        values: {
          essential: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        name: "Componentização front-end",
        values: {
          essential: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        name: "Backend/API",
        values: {
          essential: false,
          pro: "Opcional",
          enterprise: true,
        },
      },
      {
        name: "Dashboard administrativo",
        values: {
          essential: false,
          pro: "Opcional",
          enterprise: true,
        },
      },
      {
        name: "Integrações externas",
        values: {
          essential: false,
          pro: true,
          enterprise: true,
        },
      },
      {
        name: "SEO técnico",
        values: {
          essential: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        name: "Deploy assistido",
        values: {
          essential: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        name: "Suporte evolutivo",
        values: {
          essential: "Base",
          pro: "Prioritário",
          enterprise: "Dedicado",
        },
      },
    ] as const satisfies readonly ComparisonFeature[],
  },
} as const;
