import type { UseCaseCategoryId } from "../../data/useCasesNavigation";
import { contactRoute } from "../../data/siteRoutes";

export type UseCaseModuleIconType = "blue" | "green" | "pink";

export type UseCaseModuleDetails = {
  intro: string;
  benefits: readonly string[];
  examples: readonly string[];
  implementation: string;
};

export type UseCaseIntegrationIconName =
  | "whatsapp"
  | "instagram"
  | "gmail"
  | "sheets"
  | "stripe";

export type UseCaseModule = {
  id: string;
  categoryId: UseCaseCategoryId;
  title: string;
  description: string;
  iconType: UseCaseModuleIconType;
  details: UseCaseModuleDetails;
};

export type UseCaseBlogTagMap = Record<UseCaseCategoryId, readonly string[]>;

const categoryDetailContext: Record<
  UseCaseCategoryId,
  {
    outcome: string;
    examples: readonly [string, string, string];
  }
> = {
  ecommerce: {
    outcome: "aumentar conversões, organizar vendas e melhorar a experiência de compra",
    examples: [
      "uma operação que vende produtos físicos em diferentes categorias",
      "uma marca que integra venda, atendimento e gestão de pedidos",
      "um catálogo digital preparado para campanhas e crescimento",
    ],
  },
  "landing-pages": {
    outcome: "transformar campanhas em oportunidades comerciais mensuráveis",
    examples: [
      "o lançamento de um novo serviço ou produto",
      "uma campanha de mídia paga com foco em captação",
      "a validação rápida de uma oferta para um público específico",
    ],
  },
  institutional: {
    outcome: "fortalecer autoridade, apresentar serviços e gerar novos contatos",
    examples: [
      "uma empresa que profissionaliza sua presença digital",
      "um negócio com diferentes serviços e públicos",
      "uma marca que quer ser encontrada e compreendida com facilidade",
    ],
  },
  saas: {
    outcome: "operar um produto digital escalável, seguro e preparado para receita recorrente",
    examples: [
      "uma plataforma B2B com diferentes planos e perfis de acesso",
      "um produto digital que atende múltiplas empresas",
      "uma solução recorrente que precisa crescer sem perder controle",
    ],
  },
  dashboards: {
    outcome: "transformar dados operacionais em decisões rápidas e confiáveis",
    examples: [
      "uma liderança que acompanha indicadores de diferentes áreas",
      "uma equipe que consulta e exporta relatórios",
      "uma operação com controles administrativos centralizados",
    ],
  },
  automations: {
    outcome: "reduzir trabalho manual, acelerar respostas e evitar falhas operacionais",
    examples: [
      "uma equipe que recebe solicitações por vários canais",
      "um processo com tarefas repetitivas e mudanças de status",
      "uma operação que precisa conectar ferramentas e dados",
    ],
  },
  crm: {
    outcome: "organizar relacionamentos, acelerar follow-ups e aumentar oportunidades de venda",
    examples: [
      "um time comercial que acompanha leads em diferentes etapas",
      "uma empresa que centraliza histórico e dados de clientes",
      "uma operação que mantém o próximo contato sempre visível",
    ],
  },
  design: {
    outcome: "garantir consistência visual, reduzir retrabalho e acelerar a evolução do produto",
    examples: [
      "um produto digital que precisa padronizar sua interface",
      "uma equipe que desenvolve novas telas com frequência",
      "um projeto que valida jornadas antes do desenvolvimento",
    ],
  },
  backend: {
    outcome: "sustentar integrações, dados e regras de negócio com segurança e escala",
    examples: [
      "uma plataforma que expõe dados para diferentes interfaces",
      "um produto que integra pagamentos, comunicação e armazenamento",
      "uma operação que estrutura dados para crescer",
    ],
  },
  marketing: {
    outcome: "atrair público qualificado, medir conversões e apoiar o crescimento comercial",
    examples: [
      "uma campanha que precisa gerar e qualificar leads",
      "uma equipe que publica ofertas para diferentes públicos",
      "uma operação que analisa origem e comportamento dos usuários",
    ],
  },
  operations: {
    outcome: "centralizar processos, melhorar visibilidade e escalar a operação com controle",
    examples: [
      "uma equipe que gerencia solicitações e aprovações internas",
      "uma empresa que acompanha entregas, projetos ou atendimentos",
      "uma operação que conecta pessoas, documentos e decisões",
    ],
  },
};

function createModuleDetails(
  title: string,
  description: string,
  categoryId: UseCaseCategoryId,
): UseCaseModuleDetails {
  const context = categoryDetailContext[categoryId];
  const moduleName = title.toLocaleLowerCase("pt-BR");

  return {
    intro: `${description} O módulo de ${moduleName} transforma essa necessidade em uma experiência clara, integrada e preparada para evoluir com o negócio.`,
    benefits: [
      `Estrutura ${moduleName} com regras e jornadas adequadas à operação real.`,
      `Ajuda a ${context.outcome}, com dados e ações organizados em um único fluxo.`,
      "Reduz atritos para usuários e equipe, mantendo clareza, segurança e facilidade de manutenção.",
    ],
    examples: context.examples.map(
      (example) => `${title} aplicado a ${example}.`,
    ),
    implementation: `A Ateliux começa entendendo objetivos, usuários, processos e integrações envolvidas. Depois, desenha a experiência, define a arquitetura e desenvolve o módulo de ${moduleName} sob medida, conectado ao restante do ecossistema digital e acompanhado por métricas que orientam as próximas evoluções.`,
  };
}

export const useCasesContent = {
  header: {
    searchPlaceholder: "Encontre módulos prontos para aplicar no seu projeto",
    integrations: [
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: "whatsapp" as UseCaseIntegrationIconName,
      },
      {
        id: "instagram",
        label: "Instagram",
        icon: "instagram" as UseCaseIntegrationIconName,
      },
      {
        id: "gmail",
        label: "Gmail",
        icon: "gmail" as UseCaseIntegrationIconName,
      },
      {
        id: "sheets",
        label: "Google Sheets",
        icon: "sheets" as UseCaseIntegrationIconName,
      },
      {
        id: "stripe",
        label: "Pagamentos",
        icon: "stripe" as UseCaseIntegrationIconName,
      },
    ],
  },
  sidebar: {
    title: "Por categoria",
    help: {
      title: "Não encontrou o que precisa?",
      description:
        "Você pode solicitar uma solução específica para o seu tipo de negócio.",
      label: "Solicitar categoria",
      href: contactRoute({ subject: "nova-categoria" }),
    },
  },
  categories: [
    {
      id: "ecommerce",
      name: "E-commerce",
    },
    {
      id: "landing-pages",
      name: "Landing Pages",
    },
    {
      id: "institutional",
      name: "Sites Institucionais",
    },
    {
      id: "saas",
      name: "SaaS",
    },
    {
      id: "dashboards",
      name: "Dashboards",
    },
    {
      id: "automations",
      name: "Automações",
    },
    {
      id: "crm",
      name: "CRM",
    },
    {
      id: "design",
      name: "Design System",
    },
    {
      id: "backend",
      name: "Backend & APIs",
    },
    {
      id: "marketing",
      name: "Marketing e Vendas",
    },
    {
      id: "operations",
      name: "Operação Digital",
    },
  ] as const,
  blogTagMap: {
    ecommerce: ["E-commerce"],
    "landing-pages": ["Landing pages"],
    institutional: ["Landing pages", "UI/UX"],
    saas: ["SaaS"],
    dashboards: ["SaaS", "Arquitetura"],
    automations: ["Automação"],
    crm: ["Automação", "SaaS"],
    design: ["UI/UX"],
    backend: ["Arquitetura"],
    marketing: ["Landing pages", "E-commerce"],
    operations: ["Automação", "Arquitetura"],
  } as const satisfies UseCaseBlogTagMap,
  modules: ([
    {
      id: "ecommerce-1",
      categoryId: "ecommerce",
      title: "Catálogo inteligente",
      description:
        "Organize produtos, categorias, imagens, variações e destaque itens estratégicos para venda.",
      iconType: "blue",
    },
    {
      id: "ecommerce-2",
      categoryId: "ecommerce",
      title: "Carrinho e checkout",
      description:
        "Crie uma jornada fluida entre produto, carrinho, pagamento e confirmação do pedido.",
      iconType: "blue",
    },
    {
      id: "ecommerce-3",
      categoryId: "ecommerce",
      title: "Integração com WhatsApp",
      description:
        "Leve pedidos, dúvidas e orçamentos diretamente para o atendimento comercial.",
      iconType: "green",
    },
    {
      id: "ecommerce-4",
      categoryId: "ecommerce",
      title: "Gestão de pedidos",
      description:
        "Acompanhe status, histórico, canais de venda e operação em uma visão simples.",
      iconType: "blue",
    },
    {
      id: "ecommerce-5",
      categoryId: "ecommerce",
      title: "Produtos em destaque",
      description:
        "Mostre ofertas, lançamentos e itens estratégicos com blocos visuais personalizados.",
      iconType: "pink",
    },
    {
      id: "ecommerce-6",
      categoryId: "ecommerce",
      title: "Cupom e campanhas",
      description:
        "Crie ações promocionais para datas comerciais, combos, campanhas e recuperação de venda.",
      iconType: "green",
    },
    {
      id: "landing-1",
      categoryId: "landing-pages",
      title: "Hero de conversão",
      description:
        "Estruture uma primeira dobra clara, com promessa, prova visual e chamada para ação.",
      iconType: "blue",
    },
    {
      id: "landing-2",
      categoryId: "landing-pages",
      title: "Seções de prova social",
      description:
        "Inclua depoimentos, resultados, cases, selos e argumentos para aumentar confiança.",
      iconType: "green",
    },
    {
      id: "landing-3",
      categoryId: "landing-pages",
      title: "Formulário de captação",
      description:
        "Capture leads qualificados com campos objetivos e integração com e-mail ou CRM.",
      iconType: "pink",
    },
    {
      id: "institutional-1",
      categoryId: "institutional",
      title: "Página institucional",
      description:
        "Apresente empresa, serviços, diferenciais e canais de contato com estrutura profissional.",
      iconType: "blue",
    },
    {
      id: "institutional-2",
      categoryId: "institutional",
      title: "SEO técnico inicial",
      description:
        "Organize metadados, headings, performance e base para indexação correta.",
      iconType: "green",
    },
    {
      id: "institutional-3",
      categoryId: "institutional",
      title: "Página de serviços",
      description:
        "Explique cada serviço com clareza, benefícios, processo e chamada para orçamento.",
      iconType: "blue",
    },
    {
      id: "saas-1",
      categoryId: "saas",
      title: "Autenticação e permissões",
      description:
        "Controle acesso por usuário, conta, plano, organização e nível de permissão.",
      iconType: "blue",
    },
    {
      id: "saas-2",
      categoryId: "saas",
      title: "Multi-tenant",
      description:
        "Estruture um produto capaz de atender múltiplos clientes com dados separados.",
      iconType: "green",
    },
    {
      id: "saas-3",
      categoryId: "saas",
      title: "Assinaturas e planos",
      description:
        "Crie estrutura para planos, limites, upgrades, cobrança e recursos liberados.",
      iconType: "pink",
    },
    {
      id: "dashboards-1",
      categoryId: "dashboards",
      title: "Visão geral da operação",
      description:
        "Centralize métricas, cards, gráficos, status e atalhos em uma tela objetiva.",
      iconType: "blue",
    },
    {
      id: "dashboards-2",
      categoryId: "dashboards",
      title: "Relatórios exportáveis",
      description:
        "Permita análise com filtros, períodos, exportação CSV/PDF e dados organizados.",
      iconType: "green",
    },
    {
      id: "dashboards-3",
      categoryId: "dashboards",
      title: "Gestão administrativa",
      description:
        "Crie CRUDs, tabelas, filtros, ações em massa e fluxos internos de controle.",
      iconType: "blue",
    },
    {
      id: "automations-1",
      categoryId: "automations",
      title: "Automação de atendimento",
      description:
        "Conecte formulários, WhatsApp, e-mail e CRM para acelerar o primeiro contato.",
      iconType: "green",
    },
    {
      id: "automations-2",
      categoryId: "automations",
      title: "Notificações automáticas",
      description:
        "Envie alertas por eventos importantes, mudanças de status e novos registros.",
      iconType: "blue",
    },
    {
      id: "automations-3",
      categoryId: "automations",
      title: "Fluxos operacionais",
      description:
        "Reduza tarefas repetitivas com processos automáticos entre sistemas e dados.",
      iconType: "pink",
    },
    {
      id: "crm-1",
      categoryId: "crm",
      title: "Pipeline comercial",
      description:
        "Organize leads, etapas, oportunidades, histórico e previsão de fechamento.",
      iconType: "blue",
    },
    {
      id: "crm-2",
      categoryId: "crm",
      title: "Cadastro de clientes",
      description:
        "Centralize informações comerciais, contatos, histórico, notas e arquivos.",
      iconType: "green",
    },
    {
      id: "crm-3",
      categoryId: "crm",
      title: "Follow-up inteligente",
      description:
        "Crie lembretes, status e próximas ações para não perder oportunidades.",
      iconType: "pink",
    },
    {
      id: "design-1",
      categoryId: "design",
      title: "Style guide",
      description:
        "Defina tipografia, paleta, botões, cards, inputs e padrões visuais do produto.",
      iconType: "blue",
    },
    {
      id: "design-2",
      categoryId: "design",
      title: "Component library",
      description:
        "Crie elementos reutilizáveis para manter consistência e acelerar desenvolvimento.",
      iconType: "green",
    },
    {
      id: "design-3",
      categoryId: "design",
      title: "Protótipo navegável",
      description:
        "Valide jornadas, páginas e interações antes de transformar em código.",
      iconType: "pink",
    },
    {
      id: "backend-1",
      categoryId: "backend",
      title: "API modular",
      description:
        "Estruture endpoints claros para produtos, clientes, pedidos, usuários e dashboards.",
      iconType: "blue",
    },
    {
      id: "backend-2",
      categoryId: "backend",
      title: "Banco de dados",
      description:
        "Modelagem de dados preparada para relatórios, integrações e crescimento.",
      iconType: "green",
    },
    {
      id: "backend-3",
      categoryId: "backend",
      title: "Integrações externas",
      description:
        "Conecte gateways, plataformas, serviços de e-mail, storage e automações.",
      iconType: "pink",
    },
    {
      id: "marketing-1",
      categoryId: "marketing",
      title: "Captação de leads",
      description:
        "Crie páginas, formulários e automações para transformar visitantes em contatos.",
      iconType: "blue",
    },
    {
      id: "marketing-2",
      categoryId: "marketing",
      title: "Páginas de campanha",
      description:
        "Publique ações comerciais com copy, design e tracking para campanhas digitais.",
      iconType: "green",
    },
    {
      id: "marketing-3",
      categoryId: "marketing",
      title: "Integração com analytics",
      description:
        "Acompanhe origem, eventos, conversões e comportamento dos usuários.",
      iconType: "pink",
    },
    {
      id: "operations-1",
      categoryId: "operations",
      title: "Central de gestão",
      description:
        "Organize processos internos, cadastros, aprovações e tarefas em um sistema próprio.",
      iconType: "blue",
    },
    {
      id: "operations-2",
      categoryId: "operations",
      title: "Controle de status",
      description:
        "Acompanhe fluxo de pedidos, projetos, entregas, solicitações ou atendimentos.",
      iconType: "green",
    },
    {
      id: "operations-3",
      categoryId: "operations",
      title: "Base operacional",
      description:
        "Crie uma estrutura digital que conecta equipe, dados, documentos e decisões.",
      iconType: "pink",
    },
  ] as const).map((module) => ({
    ...module,
    details: createModuleDetails(
      module.title,
      module.description,
      module.categoryId,
    ),
  })) satisfies readonly UseCaseModule[],
} as const;
