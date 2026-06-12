export type BlogArtworkName =
  | "hero"
  | "pixels"
  | "yellowShapes"
  | "circles"
  | "softSystem"
  | "gradient"
  | "lines";

export type BlogPost = {
  slug: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  artwork: BlogArtworkName;
};

export type BlogArticleSection = {
  title?: string;
  paragraphs: readonly string[];
};

export type BlogArticleRelatedItem = {
  slug: string;
  title: string;
  description: string;
};

export type BlogArticleComment = {
  id: string;
  author: string;
  role: string;
  date: string;
  content: string;
};

export type BlogArticle = BlogPost & {
  category: string;
  subtitle: string;
  author: string;
  readTime: string;
  shares: number;
  comments: number;
  heroImage: string;
  heroAlt: string;
  body: readonly BlogArticleSection[];
  sideNote: {
    eyebrow: string;
    title: string;
    description: string;
  };
  relatedItems: readonly BlogArticleRelatedItem[];
  inlineMedia: {
    artwork: BlogArtworkName;
    title: string;
    caption: string;
  };
  commentItems: readonly BlogArticleComment[];
};

export const blogContent = {
  hero: {
    title: "Ateliux Blog",
    description:
      "Conteúdos sobre software, design, tecnologia, e-commerce, SaaS e construção de produtos digitais reais.",
  },
  featuredPost: {
    slug: "por-tras-de-produtos-digitais-que-realmente-funcionam",
    tag: "Engenharia de produto",
    date: "17 março, 2026",
    title: "Por trás de produtos digitais que realmente funcionam",
    description:
      "Como design, arquitetura, código e estratégia se conectam para transformar uma ideia em software pronto para uso.",
    artwork: "hero" as BlogArtworkName,
  },
  newsletter: {
    title: "Receba insights sobre software, design e negócios digitais",
    placeholder: "Digite seu e-mail",
    ctaLabel: "Inscrever",
  },
  social: {
    title: "Acompanhe a Ateliux",
    description:
      "Veja novidades, bastidores e conteúdos sobre tecnologia aplicada a negócios.",
    links: [
      {
        label: "X",
        href: "#x",
        icon: "x",
      },
      {
        label: "Instagram",
        href: "#instagram",
        icon: "instagram",
      },
      {
        label: "LinkedIn",
        href: "#linkedin",
        icon: "linkedin",
      },
    ],
  },
  posts: [
    {
      slug: "papel-do-design-em-softwares-faceis-de-usar",
      tag: "UI/UX",
      date: "12 março, 2026",
      title: "O papel do design na criação de softwares mais fáceis de usar",
      description:
        "Entenda como uma boa experiência reduz dúvidas, melhora conversões e torna sistemas mais intuitivos.",
      artwork: "pixels",
    },
    {
      slug: "como-estruturar-uma-loja-online-pronta-para-vender",
      tag: "E-commerce",
      date: "08 março, 2026",
      title: "Como estruturar uma loja online pronta para vender",
      description:
        "Catálogo, produto, carrinho, checkout, WhatsApp e operação conectados em uma experiência simples.",
      artwork: "yellowShapes",
    },
    {
      slug: "o-que-considerar-antes-de-criar-um-saas",
      tag: "SaaS",
      date: "02 março, 2026",
      title: "O que considerar antes de criar um SaaS para sua empresa",
      description:
        "Módulos, usuários, permissões, dashboards, dados e arquitetura precisam nascer com direção clara.",
      artwork: "circles",
    },
    {
      slug: "quando-automatizar-processos-internos",
      tag: "Automação",
      date: "24 fevereiro, 2026",
      title: "Quando automatizar processos internos do seu negócio",
      description:
        "Veja sinais de que sua operação precisa de integrações, rotinas automáticas e sistemas mais conectados.",
      artwork: "softSystem",
    },
    {
      slug: "landing-pages-clareza-velocidade-conversao",
      tag: "Landing pages",
      date: "18 fevereiro, 2026",
      title: "Landing pages que unem clareza, velocidade e conversão",
      description:
        "Uma boa página precisa comunicar rápido, carregar bem e guiar o visitante para uma ação objetiva.",
      artwork: "gradient",
    },
    {
      slug: "como-frontend-backend-banco-de-dados-trabalham-juntos",
      tag: "Arquitetura",
      date: "10 fevereiro, 2026",
      title: "Como frontend, backend e banco de dados trabalham juntos",
      description:
        "Uma visão simples sobre a base técnica que sustenta sites, dashboards, SaaS e ecossistemas digitais.",
      artwork: "lines",
    },
  ] as const satisfies readonly BlogPost[],
} as const;

const articleHeroImages: Record<string, { src: string; alt: string }> = {
  "Engenharia de produto": {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=85",
    alt: "Dashboard digital com dados e indicadores de produto",
  },
  "UI/UX": {
    src: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1800&q=85",
    alt: "Profissional trabalhando na interface de um produto digital",
  },
  "E-commerce": {
    src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=85",
    alt: "Experiência digital de compra e pagamento",
  },
  SaaS: {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=85",
    alt: "Painel de produto SaaS exibido em um notebook",
  },
  Automação: {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=85",
    alt: "Circuitos que representam sistemas e automações conectadas",
  },
  "Landing pages": {
    src: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1800&q=85",
    alt: "Equipe analisando uma experiência digital",
  },
  Arquitetura: {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1800&q=85",
    alt: "Infraestrutura de servidores para aplicações digitais",
  },
};

const commentAuthors = [
  { author: "Marina Costa", role: "Product Designer" },
  { author: "Rafael Martins", role: "Fundador de SaaS" },
  { author: "Camila Rocha", role: "Gerente de Operações" },
  { author: "Lucas Almeida", role: "Desenvolvedor Frontend" },
  { author: "Beatriz Ferreira", role: "E-commerce Manager" },
  { author: "Thiago Nunes", role: "Tech Lead" },
  { author: "Juliana Ribeiro", role: "Consultora de Negócios" },
  { author: "André Lima", role: "Especialista em Automação" },
  { author: "Fernanda Souza", role: "UX Researcher" },
] as const;

const commentMessages = [
  "A conexão entre experiência e operação é um ponto que muitas equipes deixam para depois. O artigo mostrou bem por que essa decisão precisa acontecer desde o início.",
  "Gostei da forma prática de explicar como uma primeira versão pode entregar valor sem limitar a evolução do produto.",
  "A clareza antes do desenvolvimento realmente reduz muito retrabalho. Já vimos isso mudar completamente o resultado de projetos internos.",
  "Excelente leitura para quem ainda enxerga design e engenharia como etapas separadas. O ganho aparece quando as duas áreas trabalham juntas.",
  "A parte sobre métricas e comportamento real foi muito relevante. Lançar sem acompanhar o uso deixa decisões importantes no escuro.",
  "Esse conteúdo organiza de maneira simples várias decisões que costumam parecer complexas no começo de um produto digital.",
  "A visão de software como parte da operação, e não apenas como uma entrega isolada, faz muita diferença para o crescimento.",
  "Boas integrações e dados organizados são fundamentais para escalar sem aumentar tarefas manuais na mesma proporção.",
  "Material muito útil para alinhar equipes técnicas e de negócio antes de iniciar uma nova etapa do projeto.",
] as const;

function createArticleComments(
  count: number,
  articleIndex: number,
): readonly BlogArticleComment[] {
  return Array.from({ length: count }, (_, commentIndex) => {
    const author =
      commentAuthors[(articleIndex + commentIndex) % commentAuthors.length];
    const content =
      commentMessages[(articleIndex * 2 + commentIndex) % commentMessages.length];

    return {
      id: `article-${articleIndex}-comment-${commentIndex}`,
      author: author.author,
      role: author.role,
      date: `${commentIndex + 1} dia${commentIndex === 0 ? "" : "s"} atrás`,
      content,
    };
  });
}

function createArticle(post: BlogPost, index: number): BlogArticle {
  const hero = articleHeroImages[post.tag] ?? articleHeroImages["Engenharia de produto"];
  const relatedPosts = [blogContent.featuredPost, ...blogContent.posts]
    .filter((item) => item.slug !== post.slug)
    .slice(index % 3, (index % 3) + 3);
  const comments = 5;

  return {
    ...post,
    category: post.tag,
    subtitle:
      "Uma visão prática sobre as decisões que conectam estratégia, experiência, tecnologia e operação para criar produtos digitais que geram valor real.",
    author: "Equipe Ateliux",
    readTime: `${7 + (index % 4)} min de leitura`,
    shares: 18 + index * 7,
    comments,
    heroImage: hero.src,
    heroAlt: hero.alt,
    body: [
      {
        paragraphs: [
          `${post.description} O desafio não está apenas em colocar uma interface no ar, mas em construir uma solução que faça sentido para quem usa, para quem opera e para os objetivos do negócio.`,
          "Produtos digitais consistentes nascem quando estratégia, design e engenharia trabalham como partes do mesmo sistema. Cada decisão visual precisa conversar com dados, regras de negócio, integrações e com a realidade da equipe que manterá a operação ativa.",
        ],
      },
      {
        title: "Clareza antes da complexidade",
        paragraphs: [
          "Antes de escolher ferramentas ou iniciar o desenvolvimento, é necessário entender qual problema precisa ser resolvido, quais pessoas participam da jornada e quais resultados devem ser acompanhados. Essa clareza reduz retrabalho e ajuda a priorizar o que realmente gera impacto.",
          `No contexto de ${post.tag.toLocaleLowerCase("pt-BR")}, isso significa transformar necessidades amplas em fluxos objetivos, módulos bem definidos e uma experiência que conduza o usuário sem fricção.`,
        ],
      },
      {
        title: "Uma base preparada para evoluir",
        paragraphs: [
          "A primeira versão precisa entregar valor rapidamente sem criar limites para as próximas etapas. Componentes reutilizáveis, dados organizados e integrações bem planejadas permitem que novas funcionalidades sejam adicionadas com segurança.",
          "Na Ateliux, design e código evoluem juntos. A interface valida a experiência, enquanto a arquitetura sustenta performance, automações e crescimento operacional.",
        ],
      },
      {
        title: "Tecnologia conectada ao negócio",
        paragraphs: [
          "O melhor software não é o mais complexo, mas aquele que simplifica decisões, reduz tarefas manuais e cria uma experiência confiável. Métricas, feedbacks e comportamento real orientam a evolução depois do lançamento.",
          "Essa abordagem transforma um projeto pontual em uma base digital capaz de vender, organizar, automatizar e escalar junto com a empresa.",
        ],
      },
    ],
    sideNote: {
      eyebrow: "Insight Ateliux",
      title: "Produto digital é uma operação viva",
      description:
        "Lançar é apenas o começo. Os melhores resultados aparecem quando produto, dados e processos continuam evoluindo de forma coordenada.",
    },
    relatedItems: relatedPosts.map((item) => ({
      slug: item.slug,
      title: item.title,
      description: item.description,
    })),
    inlineMedia: {
      artwork: post.artwork,
      title: "Da direção à execução",
      caption:
        "Uma linguagem visual consistente ajuda equipes e usuários a compreenderem o produto com menos esforço.",
    },
    commentItems: createArticleComments(comments, index),
  };
}

export const blogArticles = [
  blogContent.featuredPost,
  ...blogContent.posts,
].map(createArticle) satisfies readonly BlogArticle[];
