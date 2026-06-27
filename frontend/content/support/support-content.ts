import { siteRoutes } from "../../data/siteRoutes";

export const supportContent = {
  hero: {
    badge: "Suporte",
    title: "Suporte ao cliente Ateliux para duvidas, projetos e pos-entrega.",
    description:
      "Uma pagina publica para orientar o melhor caminho de atendimento antes de abrir uma solicitacao ou iniciar uma nova conversa com a Ateliux.",
  },
  channels: [
    {
      icon: "project",
      title: "Projeto em andamento",
      description:
        "Para alinhar etapas, revisar pendencias, entender proximas entregas ou organizar uma nova demanda dentro do projeto.",
      action: "Organizar solicitacao",
    },
    {
      icon: "commercial",
      title: "Duvidas comerciais",
      description:
        "Para entender planos, escopo, orcamento, prazos, tipos de projeto e o melhor ponto de partida para sua empresa.",
      action: "Falar sobre proposta",
    },
    {
      icon: "delivery",
      title: "Pos-entrega",
      description:
        "Para ajustes, melhorias, suporte evolutivo, novas fases, publicacao, estabilidade e continuidade tecnica.",
      action: "Solicitar suporte",
    },
  ],
  process: {
    title: "Como o atendimento e organizado.",
    description:
      "A Ateliux prioriza clareza de escopo, contexto tecnico e registro objetivo da necessidade antes de indicar o melhor proximo passo.",
    steps: [
      {
        title: "Contexto",
        description:
          "Voce descreve o que precisa, qual projeto esta envolvido e qual impacto esperado.",
      },
      {
        title: "Triagem",
        description:
          "A demanda e avaliada para separar duvida comercial, suporte tecnico, ajuste de escopo ou evolucao.",
      },
      {
        title: "Direcionamento",
        description:
          "Indicamos o caminho adequado: resposta orientativa, proposta, suporte pontual ou proxima fase.",
      },
    ],
  },
  notes: [
    "O suporte real depende do escopo contratado e das combinacoes feitas com a Ateliux.",
    "As telas de login e cadastro ainda sao visuais e nao abrem uma sessao real neste momento.",
    "Solicitacoes com arquivos, acessos ou dados sensiveis devem ser combinadas diretamente com a equipe.",
  ],
  form: {
    eyebrow: "Solicitacao de suporte",
    title: "Abra uma solicitacao sem sair da pagina de suporte.",
    description:
      "Use este formulario para organizar duvidas, ajustes, problemas ou pedidos de acompanhamento relacionados ao seu projeto.",
    mockNotice:
      "Formulario visual: o envio real sera conectado quando houver backend de atendimento.",
    submitLabel: "Enviar solicitacao",
    successMessage:
      "Solicitacao registrada visualmente. A integracao real de atendimento sera conectada em uma etapa futura.",
    fields: {
      name: {
        label: "Nome",
        placeholder: "Seu nome",
      },
      email: {
        label: "E-mail",
        placeholder: "voce@empresa.com",
      },
      company: {
        label: "Empresa ou projeto",
        placeholder: "Nome da empresa ou projeto",
      },
      category: {
        label: "Tipo de suporte",
        placeholder: "Selecione uma opcao",
      },
      priority: {
        label: "Prioridade",
        placeholder: "Selecione a prioridade",
      },
      subject: {
        label: "Assunto",
        placeholder: "Resumo rapido da solicitacao",
      },
      message: {
        label: "Detalhes da solicitacao",
        placeholder:
          "Descreva o que aconteceu, onde ocorreu, qual impacto e o que voce precisa que seja avaliado.",
      },
    },
    categories: [
      "Projeto em andamento",
      "Ajuste pos-entrega",
      "Duvida tecnica",
      "Acesso ao Portal do Cliente",
      "Arquivos ou materiais",
      "Financeiro ou contrato",
      "Outro suporte",
    ],
    priorities: ["Baixa", "Media", "Alta", "Critica"],
  },
  cta: {
    title: "Precisa registrar uma solicitacao?",
    description:
      "Preencha o formulario de suporte nesta pagina para deixar o atendimento com contexto desde o primeiro contato.",
    primary: {
      label: "Ir para formulario",
      href: "#solicitacao-suporte",
    },
    secondary: {
      label: "Consultar FAQ",
      href: siteRoutes.faq,
    },
  },
} as const;
