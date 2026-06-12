import { contactRoute, siteRoutes } from "../../data/siteRoutes";

export const contactContent = {
  hero: {
    title: "Solicite um orçamento",
    description:
      "Conte para a Ateliux o que você quer construir. Vamos entender sua ideia, organizar o escopo e indicar o melhor caminho para transformar seu projeto em uma solução digital real.",
  },
  quote: {
    submitLabel: "Solicitar orçamento",
    projectTypes: [
      "Landing page",
      "Site institucional",
      "E-commerce",
      "SaaS",
      "Dashboard",
      "Automação",
      "Ecossistema digital",
    ],
    fields: {
      name: {
        label: "Seu nome",
        placeholder: "Digite seu nome",
      },
      email: {
        label: "E-mail",
        placeholder: "voce@empresa.com",
      },
      phone: {
        label: "Telefone",
        placeholder: "(00) 00000-0000",
      },
      company: {
        label: "Empresa",
        placeholder: "Nome da empresa",
      },
      projectType: {
        label: "Tipo de projeto",
        placeholder: "Selecione uma opção",
      },
      budget: {
        label: "Orçamento estimado",
        placeholder: "Ex: R$ 3.000 a R$ 8.000",
      },
      timeline: {
        label: "Prazo máximo para o projeto",
        placeholder: "Ex: 30 dias, 60 dias...",
      },
      currentSite: {
        label: "Site atual ou referência",
        placeholder: "https://...",
      },
      skills: {
        label: "O que você precisa?",
        placeholder:
          "Design, frontend, backend, dashboard, checkout, automações...",
      },
      file: {
        label: "Enviar arquivo",
        placeholder:
          "Arraste um briefing, referência ou clique no botão abaixo",
        buttonLabel: "Enviar arquivo",
      },
      message: {
        label: "Mensagem",
        placeholder:
          "Conte um pouco sobre sua ideia, objetivo, funcionalidades e o momento atual do seu negócio.",
      },
    },
  },
  clients: {
    title: "Empresas e projetos que podemos atender",
    items: ["Startups", "E-commerce", "SaaS", "Dashboards"],
  },
  footer: {
    brand: {
      name: "Ateliux",
    },
    offices: [
      {
        flag: "🇧🇷",
        title: "Atendimento Brasil",
        address: "Projetos remotos para empresas em todo o Brasil",
        phone: "WhatsApp: informe seu número comercial",
        email: "contato@ateliux.com.br",
      },
      {
        flag: "🌎",
        title: "Atendimento digital",
        address: "Reuniões online, diagnóstico e acompanhamento por etapas",
        phone: "Briefing, proposta e roadmap do projeto",
        email: "synth.creative.company@gmail.com",
      },
    ],
    linkColumns: [
      {
        title: "Links úteis",
        links: [
          {
            label: "Solicitar orçamento",
            href: contactRoute({ subject: "orcamento" }),
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
            label: "Design",
            href: siteRoutes.design,
          },
        ],
      },
      {
        title: "Empresa",
        links: [
          {
            label: "Sobre",
            href: siteRoutes.about,
          },
          {
            label: "Blog",
            href: siteRoutes.blog,
          },
          {
            label: "Login",
            href: siteRoutes.login,
          },
          {
            label: "Criar conta",
            href: siteRoutes.register,
          },
        ],
      },
      {
        title: "Legal",
        links: [
          {
            label: "Termos",
            href: siteRoutes.terms,
          },
          {
            label: "Privacidade",
            href: siteRoutes.privacy,
          },
        ],
      },
    ],
    form: {
      title: "Tem alguma dúvida? Envie uma mensagem.",
      namePlaceholder: "Seu nome",
      emailPlaceholder: "Endereço de e-mail",
      messagePlaceholder: "Sua mensagem",
      submitLabel: "Enviar mensagem",
    },
  },
} as const;
