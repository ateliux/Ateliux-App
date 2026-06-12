export type CodeExampleKey = "hello" | "productApi" | "projectBlueprint";

export type CodeExample = {
  label: string;
  method: "GET" | "POST";
  route: string;
  summary: string;
  defaultCode: string;
  docs: string[];
  schema: string;
};

export const backendBrowserContent = {
  title: "Do código ao projeto funcionando.",
  description: [
    "Veja como uma ideia começa a ganhar vida com lógica, API e estrutura real.",
    "Código claro, resposta imediata e base pronta para evoluir.",
  ],
  editorHint: "Teste uma entrega Ateliux abaixo",
  editor: {
    url: "https://preview.ateliux.com.br/api/enterprise",
    primaryTab: "Código",
    secondaryTab: "Módulos",
    language: "TypeScript",
    runLabel: "Executar",
    runOptionsLabel: "Opções",
    docsLabel: "Docs",
    outputLabel: "Resposta da API",
  },
  sampleLabel: "Modelos de API Ateliux",
  moreExamplesLabel: "Ver próximo modelo",
  examples: {
    hello: {
      label: "Hello World",
      method: "GET",
      route: "/api/hello",
      summary: "Endpoint simples para validar se o ambiente está funcionando.",
      defaultCode: `export function GET() {
  const message = "hello, world!";

  return Response.json({
    message,
    service: "Ateliux API",
    ready: true,
  });
}`,
      docs: [
        "Valida se o ambiente está respondendo corretamente.",
        "Simula uma primeira rota funcional do projeto.",
        "Ideal para testar deploy, runtime e comunicação básica.",
      ],
      schema: `{
  "message": "string",
  "service": "string",
  "ready": "boolean"
}`,
    },
    productApi: {
      label: "Produto API",
      method: "GET",
      route: "/api/storefront/products/:slug",
      summary: "Endpoint de produto para e-commerce com preço, estoque e canais de venda.",
      defaultCode: `type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  featured: boolean;
  channels: string[];
};

const product: Product = {
  id: "prod_ateliux_001",
  name: "Açaí Premium 500ml",
  slug: "acai-premium-500ml",
  category: "Delivery",
  price: 22,
  stock: 18,
  featured: true,
  channels: ["site", "whatsapp", "ifood"],
};

export function GET() {
  return Response.json({
    product,
    available: product.stock > 0,
    currency: "BRL",
    cache: "revalidate=60s",
  });
}`,
      docs: [
        "Representa uma rota real de vitrine para e-commerce.",
        "Permite exibir nome, preço, estoque, categoria e canais de venda.",
        "A resposta pode alimentar páginas de produto, cardápio, checkout ou dashboard.",
      ],
      schema: `{
  "product": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "category": "string",
    "price": "number",
    "stock": "number",
    "featured": "boolean",
    "channels": "string[]"
  },
  "available": "boolean",
  "currency": "BRL",
  "cache": "string"
}`,
    },
    projectBlueprint: {
      label: "Projeto SaaS",
      method: "POST",
      route: "/api/ateliux/project-blueprint",
      summary: "Gera uma visão técnica inicial para SaaS, landing pages, sistemas e ecossistemas digitais.",
      defaultCode: `type ProjectRequest = {
  business: string;
  projectType: string;
  goal: string;
  features: string[];
};

const project: ProjectRequest = {
  business: "Empresa em crescimento",
  projectType: "SaaS com dashboard",
  goal: "Centralizar vendas, clientes e operação",
  features: ["login", "dashboard", "cadastro", "relatórios", "automação"],
};

export function POST() {
  return Response.json({
    project,
    recommendedStack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "NestJS",
      "PostgreSQL",
    ],
    roadmap: [
      "Design UI/UX",
      "Frontend",
      "Backend API",
      "Testes",
      "Deploy",
    ],
    nextStep: "Transformar o escopo em protótipo navegável.",
  });
}`,
      docs: [
        "Simula uma etapa de arquitetura inicial do projeto.",
        "Ajuda o cliente a visualizar stack, módulos e caminho de execução.",
        "Funciona para SaaS, e-commerce, landing pages, sistemas internos e ecossistemas digitais.",
      ],
      schema: `{
  "project": {
    "business": "string",
    "projectType": "string",
    "goal": "string",
    "features": "string[]"
  },
  "recommendedStack": "string[]",
  "roadmap": "string[]",
  "nextStep": "string"
}`,
    },
  },
  deploy: {
    title: "Planejar. Construir. Publicar.",
    description: "Da primeira ideia ao projeto funcionando com base técnica, visual e estratégica.",
    features: [
      {
        icon: "simple",
        title: "Clareza",
        description: "Cada etapa nasce com objetivo, escopo e direção definidos.",
      },
      {
        icon: "secure",
        title: "Segurança",
        description: "Arquitetura pensada para proteger dados, acessos e operação.",
      },
      {
        icon: "scalable",
        title: "Escala",
        description: "Projetos preparados para crescer sem travar a evolução do negócio.",
      },
      {
        icon: "runnable",
        title: "Funcional",
        description: "O cliente acompanha entregas que já podem ser testadas.",
      },
      {
        icon: "debuggable",
        title: "Testável",
        description: "Fluxos, integrações e respostas são validados antes da entrega.",
      },
      {
        icon: "sync",
        title: "Integrado",
        description: "Frontend, backend, dados e automações trabalhando juntos.",
      },
    ],
  },
  missingLink: {
    title: "A ponte entre ideia e software.",
    description: "A Ateliux conecta design, código, dados e estratégia para tirar projetos do papel.",
    badge: {
      eyebrow: "Ateliux",
      text: "Software sob medida",
      mark: "A",
    },
  },
} as const;

export const backendExampleKeys = [
  "hello",
  "productApi",
  "projectBlueprint",
] as const;