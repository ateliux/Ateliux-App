import { contactRoute, siteRoutes } from "../../data/siteRoutes";

export const faqContent = {
  hero: {
    badge: "FAQ",
    title: "Perguntas frequentes sobre projetos, processos e suporte Ateliux.",
    description:
      "Uma central objetiva para entender como a Ateliux organiza projetos digitais, atendimento, entregas, escopo e proximos passos.",
  },
  highlights: [
    {
      value: "01",
      label: "Diagnostico antes da proposta",
      description:
        "Comecamos entendendo objetivo, negocio, publico, funcionalidades e restricoes tecnicas.",
    },
    {
      value: "02",
      label: "Escopo organizado por etapas",
      description:
        "O projeto e dividido em planejamento, design, desenvolvimento, validacao e publicacao.",
    },
    {
      value: "03",
      label: "Suporte alinhado ao contrato",
      description:
        "Depois da entrega, o suporte pode ser pontual ou evolutivo conforme o plano combinado.",
    },
  ],
  categories: [
    {
      title: "Projetos",
      items: [
        {
          question: "A Ateliux cria apenas sites?",
          answer:
            "Nao. A Ateliux cria sites institucionais, landing pages, e-commerce, SaaS, dashboards, automacoes, APIs, design systems e ecossistemas digitais sob medida.",
        },
        {
          question: "Como um projeto comeca?",
          answer:
            "O primeiro passo e um diagnostico para entender objetivo, escopo, publico, funcionalidades, prazo e complexidade. Depois disso, organizamos a rota de execucao e a proposta.",
        },
        {
          question: "O valor do projeto e fechado?",
          answer:
            "Depende do escopo. Alguns projetos podem partir de uma base mais previsivel, enquanto produtos sob medida precisam de levantamento tecnico antes da proposta final.",
        },
      ],
    },
    {
      title: "Processo",
      items: [
        {
          question: "A Ateliux tambem cuida do design?",
          answer:
            "Sim. A etapa visual pode incluir UI, UX, identidade de interface, componentes, responsividade e preparacao do design para virar codigo com qualidade.",
        },
        {
          question: "Posso pedir mudancas durante o projeto?",
          answer:
            "Sim. Ajustes dentro do escopo sao tratados no fluxo normal. Mudancas maiores sao avaliadas para entender impacto em prazo, custo e prioridades.",
        },
        {
          question: "Como acompanho o andamento?",
          answer:
            "O acompanhamento e feito por etapas, alinhamentos e entregas de revisao. A area de cliente existe no frontend e deve evoluir para um portal protegido com dados reais.",
        },
      ],
    },
    {
      title: "Conta e suporte",
      items: [
        {
          question: "Login e criar conta ja liberam acesso real?",
          answer:
            "Ainda nao. As telas de login e cadastro sao visuais neste momento. A autenticacao real deve ser implementada em uma etapa futura com backend, sessao e regras de acesso.",
        },
        {
          question: "Existe suporte depois da entrega?",
          answer:
            "Sim, quando previsto no escopo ou contratado como suporte evolutivo. O formato pode incluir ajustes, melhorias, acompanhamento tecnico e novas fases do produto.",
        },
        {
          question: "Qual canal devo usar para pedir ajuda?",
          answer:
            "Use a pagina de suporte para entender o tipo de solicitacao e, quando precisar registrar uma mensagem, avance pela pagina de contato.",
        },
      ],
    },
  ],
  cta: {
    eyebrow: "Ainda ficou alguma duvida?",
    title: "Fale com a Ateliux e organize o proximo passo com clareza.",
    description:
      "Se a sua pergunta envolve escopo, proposta, suporte ou continuidade de projeto, envie sua mensagem para receber um direcionamento adequado.",
    primary: {
      label: "Solicitar atendimento",
      href: contactRoute({ subject: "suporte" }),
    },
    secondary: {
      label: "Ver suporte",
      href: siteRoutes.support,
    },
  },
} as const;
