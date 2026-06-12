export type AboutServiceIconName = "triangles" | "layers";

export const aboutContent = {
  intro: {
    badge: "Sobre a Ateliux",
    title: {
      main: "Criamos softwares, sites e plataformas para transformar ideias em produtos digitais reais.",
      highlight:
        "Unimos design, engenharia e estratégia para construir soluções sob medida para cada negócio.",
    },
    gridTitle: "Conectamos tudo",
    pillars: [
      {
        title: "Estratégia digital",
        description:
          "Entendemos o objetivo do projeto, o público, o modelo de negócio e o caminho técnico antes de começar a construir.",
      },
      {
        title: "Design UI/UX",
        description:
          "Desenhamos interfaces claras, modernas e funcionais para que cada tela tenha propósito, usabilidade e identidade.",
      },
      {
        title: "Engenharia de software",
        description:
          "Transformamos o design em código com estrutura, componentização, performance e base preparada para evolução.",
      },
      {
        title: "Segurança e escala",
        description:
          "Planejamos autenticação, APIs, dados, integrações e arquitetura pensando no crescimento real da operação.",
      },
    ],
  },
  expertise: {
    badge: "Especialidades",
    title: {
      lineOne: "Especialistas em",
      lineTwo: "produtos digitais",
    },
    description:
      "A Ateliux atua do primeiro desenho à entrega técnica, criando soluções que conectam presença digital, sistemas, automações e operação.",
    cta: {
      label: "Todos os serviços",
      serviceName: "Portfólio completo da Ateliux",
    },
    quickAction: {
      serviceName: "Diagnóstico de arquitetura digital",
      ariaLabel: "Abrir diagnóstico de arquitetura digital",
    },
    services: [
      {
        title: "Desenvolvimento sob medida",
        description:
          "Criamos sites, landing pages, e-commerce, dashboards, SaaS e sistemas internos com design, código e arquitetura alinhados ao objetivo do negócio.",
        serviceName: "Desenvolvimento sob medida",
        ariaLabel: "Abrir detalhes sobre desenvolvimento sob medida",
        icon: "triangles" as AboutServiceIconName,
      },
      {
        title: "Ecossistemas digitais",
        description:
          "Conectamos frontend, backend, banco de dados, APIs, automações e dashboards para criar uma operação digital mais autônoma e integrada.",
        serviceName: "Ecossistemas digitais",
        ariaLabel: "Abrir detalhes sobre ecossistemas digitais",
        icon: "layers" as AboutServiceIconName,
      },
    ],
  },
  metrics: {
    title: "Design, código e estratégia confirmam nossa forma de construir",
    items: [
      {
        value: "100%",
        description:
          "Cada projeto é pensado de forma sob medida, respeitando objetivo, identidade, fluxo de uso e necessidade real do negócio.",
      },
      {
        value: "4+",
        description:
          "Atuamos em frentes essenciais para empresas digitais: sites, e-commerce, SaaS, dashboards, integrações e automações.",
      },
    ],
  },
  drawer: {
    eyebrow: "Ateliux",
    title: "Pedir informações",
    selectedLabel: "Área selecionada",
    defaultService: "Consulta geral",
    success: {
      title: "Mensagem enviada!",
      description:
        "Recebemos seu contexto e vamos analisar a melhor forma de transformar essa ideia em uma solução digital.",
    },
    form: {
      nameLabel: "Nome completo",
      namePlaceholder: "Seu nome",
      emailLabel: "E-mail profissional",
      emailPlaceholder: "voce@empresa.com",
      messageLabel: "Contexto do projeto",
      messagePlaceholder:
        "Conte um pouco sobre sua ideia, objetivo, operação ou sistema que deseja construir...",
      submitLabel: "Enviar pedido",
    },
    securityText: "🔒 Dados protegidos e usados apenas para retorno comercial",
  },
} as const;