export type LegalSection = {
  title: string;
  paragraphs: readonly string[];
  notice?: readonly string[];
};

export type LegalPageContent = {
  id: "terms" | "portalTerms" | "privacy" | "cookies" | "lgpd";
  title: string;
  updatedAt: string;
  sections: readonly LegalSection[];
};

const legalReviewNotice =
  "Este documento e uma base tecnica e informativa. Ele deve ser revisado por assessoria juridica antes de uso como documento legal definitivo.";

export const legalContent = {
  terms: {
    id: "terms",
    title: "Termos de Uso",
    updatedAt: "29 de junho de 2026",
    sections: [
      {
        title: "Visao geral",
        paragraphs: [
          "Estes Termos de Uso regulam o acesso ao site, formularios, conteudos, materiais e canais digitais da Ateliux.",
          "A Ateliux desenvolve sites, landing pages, e-commerce, SaaS, dashboards, automacoes, portais e sistemas sob medida conforme proposta, contrato e escopo aprovado.",
        ],
        notice: [legalReviewNotice],
      },
      {
        title: "Uso permitido",
        paragraphs: [
          "Voce deve utilizar os canais da Ateliux de forma licita, etica e compatvel com as finalidades apresentadas.",
          "Nao e permitido tentar acessar areas restritas, explorar falhas, interferir na seguranca, enviar conteudo malicioso ou utilizar os servicos para violar direitos de terceiros.",
        ],
      },
      {
        title: "Propostas, escopo e entregas",
        paragraphs: [
          "Prazos, valores, etapas, entregaveis, revisoes e responsabilidades sao definidos em proposta comercial, contrato ou acordo formal entre as partes.",
          "Mudancas fora do escopo aprovado podem exigir nova avaliacao de prazo, orcamento, prioridades e responsabilidades.",
        ],
      },
      {
        title: "Responsabilidades do cliente",
        paragraphs: [
          "O cliente e responsavel por fornecer informacoes corretas, materiais, textos, imagens, acessos, aprovacoes e autorizacoes necessarias para a execucao do projeto.",
          "O cliente nao deve enviar dados, marcas, imagens, textos ou arquivos que nao esteja autorizado a utilizar.",
        ],
      },
      {
        title: "Limitacoes",
        paragraphs: [
          "Ferramentas externas, hospedagem, APIs, plataformas de pagamento, provedores de e-mail e servicos de terceiros podem possuir termos e indisponibilidades proprios.",
          "A Ateliux busca aplicar boas praticas tecnicas, mas nenhum sistema digital e totalmente imune a falhas, riscos operacionais ou indisponibilidades externas.",
        ],
      },
    ],
  },
  portalTerms: {
    id: "portalTerms",
    title: "Termos do Portal do Cliente",
    updatedAt: "29 de junho de 2026",
    sections: [
      {
        title: "Finalidade do portal",
        paragraphs: [
          "O Portal do Cliente e uma area autenticada para acompanhamento de projetos, etapas, briefings, aprovacoes, solicitacoes, arquivos, cronograma, suporte e financeiro.",
          "O uso do portal deve respeitar o escopo contratado, a seguranca da conta e as regras de confidencialidade aplicaveis ao projeto.",
        ],
        notice: [legalReviewNotice],
      },
      {
        title: "Conta e acesso",
        paragraphs: [
          "O usuario deve proteger credenciais, nao compartilhar senha e avisar a Ateliux se identificar uso indevido ou acesso nao autorizado.",
          "A Ateliux pode bloquear ou revisar acessos em caso de risco de seguranca, suspeita de fraude, uso indevido ou encerramento da relacao contratual.",
        ],
      },
      {
        title: "Arquivos e aprovacoes",
        paragraphs: [
          "Arquivos enviados pelo cliente podem passar por verificacao tecnica antes de ficarem disponiveis para download ou uso no projeto.",
          "Aprovacoes, solicitacoes de ajuste e respostas enviadas no portal podem ser registradas para historico operacional, auditoria e continuidade do projeto.",
        ],
      },
      {
        title: "Dados do projeto",
        paragraphs: [
          "Informacoes do portal devem ser usadas apenas para acompanhamento do projeto e comunicacao entre cliente e equipe Ateliux.",
          "Dados, arquivos e materiais do projeto podem ser mantidos enquanto forem necessarios para execucao, suporte, obrigacoes legais, historico e seguranca.",
        ],
      },
    ],
  },
  privacy: {
    id: "privacy",
    title: "Politica de Privacidade",
    updatedAt: "29 de junho de 2026",
    sections: [
      {
        title: "Visao geral",
        paragraphs: [
          "Esta Politica de Privacidade explica como a Ateliux coleta, utiliza, armazena e protege dados pessoais em seu site publico, blog, formularios, area de suporte, Portal do Cliente e dashboard administrativa.",
          "A Ateliux trata dados para atendimento comercial, execucao de projetos, suporte, comunicacao, seguranca, auditoria, cumprimento de obrigacoes e melhoria dos servicos.",
        ],
        notice: [legalReviewNotice],
      },
      {
        title: "Dados coletados",
        paragraphs: [
          "Podemos coletar nome, e-mail, telefone, empresa, cargo, mensagem, tipo de projeto, orcamento, prazo, site atual, anexos, preferencias de comunicacao, dados de login, registros de suporte e informacoes enviadas no Portal do Cliente.",
          "Tambem podemos registrar dados tecnicos como IP, User-Agent, cookies de sessao, logs de seguranca, historico de acoes, status de arquivos e dados de auditoria.",
        ],
      },
      {
        title: "Finalidades de tratamento",
        paragraphs: [
          "Os dados podem ser usados para responder contatos, preparar propostas, executar projetos, liberar acesso ao portal, manter sessao autenticada, processar uploads, responder suporte, enviar notificacoes e registrar aprovacoes.",
          "Com seu consentimento, dados tambem podem ser utilizados para newsletter, comunicacoes comerciais, analise de uso e mensuracao de campanhas.",
        ],
      },
      {
        title: "Compartilhamento",
        paragraphs: [
          "A Ateliux nao vende dados pessoais. O compartilhamento pode ocorrer com provedores tecnicos necessarios, como hospedagem, banco de dados, storage, e-mail, filas, analytics, seguranca e ferramentas de suporte.",
          "Tambem pode haver compartilhamento quando exigido por lei, autoridade competente, cumprimento contratual ou protecao de direitos.",
        ],
      },
      {
        title: "Seguranca e retencao",
        paragraphs: [
          "Aplicamos medidas tecnicas e organizacionais para reduzir riscos de acesso indevido, perda, alteracao, vazamento ou uso nao autorizado.",
          "Dados sao mantidos pelo tempo necessario para cumprir as finalidades informadas, contratos, obrigacoes legais, auditoria, defesa de direitos, suporte e continuidade operacional.",
        ],
      },
      {
        title: "Direitos do titular",
        paragraphs: [
          "Voce pode solicitar acesso, confirmacao de tratamento, correcao, portabilidade, eliminacao, informacao sobre compartilhamento ou revogacao de consentimento quando aplicavel.",
          "Solicitacoes podem ser feitas pela pagina LGPD. A Ateliux podera solicitar informacoes adicionais para validar identidade e proteger dados de terceiros.",
        ],
      },
    ],
  },
  cookies: {
    id: "cookies",
    title: "Politica de Cookies",
    updatedAt: "29 de junho de 2026",
    sections: [
      {
        title: "O que sao cookies",
        paragraphs: [
          "Cookies sao pequenos registros armazenados no navegador para manter funcionamento, seguranca, preferencias, analise de uso e, quando autorizado, mensuracao de campanhas.",
          "A Ateliux utiliza cookies necessarios por padrao e solicita consentimento para categorias nao essenciais.",
        ],
        notice: [legalReviewNotice],
      },
      {
        title: "Categorias utilizadas",
        paragraphs: [
          "Necessarios: mantem login, seguranca, cookies httpOnly de autenticacao, protecao de sessao e funcionamento basico.",
          "Preferencias: guardam escolhas de experiencia, como consentimento de cookies e configuracoes de interface.",
          "Analiticos: ajudam a entender uso agregado do site e desempenho de paginas, quando ferramentas de analytics forem configuradas.",
          "Marketing: permitem mensuracao de campanhas e comunicacoes comerciais, quando houver integracoes configuradas e consentimento valido.",
        ],
      },
      {
        title: "Gerenciamento",
        paragraphs: [
          "Voce pode aceitar todos, recusar cookies nao essenciais ou personalizar preferencias no banner de cookies.",
          "As preferencias podem ser reabertas pelo link Preferencias de cookies no footer. Cookies necessarios nao podem ser desativados pelo painel porque sao indispensaveis para seguranca e funcionamento.",
        ],
      },
      {
        title: "Cookies de terceiros",
        paragraphs: [
          "Ferramentas externas podem definir cookies proprios conforme suas politicas. A Ateliux deve bloquear scripts nao essenciais ate que o consentimento correspondente exista.",
          "Se novas ferramentas forem adicionadas, o inventario de cookies deve ser atualizado antes do deploy.",
        ],
      },
    ],
  },
  lgpd: {
    id: "lgpd",
    title: "LGPD e Direitos do Titular",
    updatedAt: "29 de junho de 2026",
    sections: [
      {
        title: "Base de atendimento LGPD",
        paragraphs: [
          "Esta pagina centraliza informacoes e um canal para solicitacoes relacionadas a dados pessoais tratados pela Ateliux.",
          "As solicitacoes podem envolver acesso, correcao, eliminacao, portabilidade, revogacao de consentimento, informacoes sobre tratamento ou outros pedidos relacionados a privacidade.",
        ],
        notice: [legalReviewNotice],
      },
      {
        title: "Como funciona a solicitacao",
        paragraphs: [
          "Ao enviar o formulario, a solicitacao e registrada no backend com data, IP, User-Agent e status inicial aberto para acompanhamento administrativo.",
          "A equipe podera pedir validacao de identidade antes de responder, especialmente quando a solicitacao envolver dados de conta, projeto, arquivos ou informacoes de terceiros.",
        ],
      },
      {
        title: "Limites e retencao",
        paragraphs: [
          "Alguns dados podem precisar ser mantidos por obrigacao legal, execucao contratual, auditoria, seguranca, prevencao a fraude ou defesa de direitos.",
          "A exclusao ou anonimizacao sera avaliada conforme a base legal aplicavel, a finalidade do dado e eventuais obrigacoes pendentes.",
        ],
      },
    ],
  },
} as const;
