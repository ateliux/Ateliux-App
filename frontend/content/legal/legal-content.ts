export type LegalSection = {
  title: string;
  paragraphs: readonly string[];
  notice?: readonly string[];
};

export type LegalPageContent = {
  id: "terms" | "privacy";
  title: string;
  sections: readonly LegalSection[];
};

export const legalContent = {
  terms: {
    id: "terms",
    title: "Termos e Condições",
    sections: [
      {
        title: "Visão geral",
        paragraphs: [
          "Estes Termos e Condições regulam o uso dos serviços, propostas, páginas, sistemas, plataformas e produtos digitais desenvolvidos ou disponibilizados pela Ateliux.",
          "Ao contratar, acessar ou utilizar qualquer solução criada pela Ateliux, você declara estar ciente das condições descritas neste documento e concorda em utilizar nossos serviços de forma ética, legal e alinhada ao escopo acordado.",
          "A Ateliux atua na criação de sites, landing pages, e-commerce, SaaS, dashboards, automações, sistemas internos e ecossistemas digitais sob medida. Cada entrega pode variar conforme briefing, contrato, proposta comercial e nível de complexidade do projeto.",
        ],
      },
      {
        title: "Escopo dos serviços",
        paragraphs: [
          "Os serviços prestados pela Ateliux são definidos com base no diagnóstico inicial, nas necessidades do cliente e no escopo aprovado antes do início da execução.",
          "Alterações que não estejam previstas no escopo inicial poderão exigir revisão de prazo, orçamento, prioridades e etapas de entrega.",
          "A Ateliux poderá sugerir melhorias técnicas, visuais e estratégicas durante o processo, sempre buscando entregar uma solução mais clara, funcional e preparada para evolução.",
        ],
      },
      {
        title: "Responsabilidades do cliente",
        paragraphs: [
          "O cliente é responsável por fornecer informações, conteúdos, acessos, referências, imagens, textos, credenciais e aprovações necessárias para o andamento do projeto.",
          "Atrasos no envio de materiais, aprovações ou respostas podem impactar diretamente o cronograma de entrega.",
        ],
        notice: [
          "O cliente não deve enviar materiais, textos, imagens, marcas ou dados que não possua autorização para utilizar.",
          "A Ateliux não se responsabiliza por conteúdos fornecidos pelo cliente que violem direitos de terceiros, leis aplicáveis ou políticas de plataformas externas.",
        ],
      },
      {
        title: "Pagamentos, prazos e entregas",
        paragraphs: [
          "Os valores, formas de pagamento, etapas e prazos serão definidos em proposta comercial, contrato ou acordo formal entre as partes.",
          "As entregas podem ocorrer por etapas, como briefing, design, desenvolvimento, revisão, testes, publicação e suporte inicial.",
          "Projetos sob medida podem depender de serviços externos, como hospedagem, domínio, APIs, gateways de pagamento, provedores de e-mail, bancos de dados e plataformas de terceiros.",
        ],
      },
      {
        title: "Uso das soluções entregues",
        paragraphs: [
          "Após a conclusão e quitação do projeto, o cliente poderá utilizar a solução conforme os termos acordados, respeitando licenças, dependências, bibliotecas, integrações e eventuais limitações técnicas.",
          "A Ateliux poderá manter registros internos, referências técnicas e aprendizados do projeto para fins de suporte, melhoria de processos e portfólio, desde que não exponha dados sigilosos do cliente sem autorização.",
        ],
      },
    ],
  },
  privacy: {
    id: "privacy",
    title: "Política de Privacidade",
    sections: [
      {
        title: "Visão geral",
        paragraphs: [
          "Esta Política de Privacidade explica como a Ateliux coleta, utiliza, armazena e protege informações relacionadas aos visitantes do site, clientes, leads, usuários e pessoas que entram em contato com nossos canais digitais.",
          "Nosso objetivo é utilizar dados de forma responsável, transparente e limitada ao necessário para comunicação, atendimento, execução de projetos e melhoria dos nossos serviços.",
          "Ao utilizar nossos formulários, páginas, canais de contato ou serviços, você concorda com as práticas descritas nesta política.",
        ],
      },
      {
        title: "Dados que podemos coletar",
        paragraphs: [
          "Podemos coletar informações fornecidas diretamente por você, como nome, e-mail, telefone, empresa, cargo, mensagem enviada, tipo de projeto desejado e demais informações necessárias para atendimento comercial ou execução do serviço.",
          "Também podemos coletar informações técnicas básicas, como endereço IP, navegador, dispositivo, páginas acessadas, origem de tráfego e interações no site, quando ferramentas de análise estiverem configuradas.",
        ],
      },
      {
        title: "Como utilizamos os dados",
        paragraphs: [
          "Utilizamos os dados para responder solicitações, preparar propostas, entender necessidades do projeto, prestar suporte, organizar etapas de desenvolvimento e melhorar a experiência dos usuários em nossos canais digitais.",
          "Também podemos utilizar informações de contato para enviar atualizações, materiais, comunicações comerciais ou conteúdos relacionados a software, design, automação, e-commerce, SaaS e produtos digitais.",
        ],
      },
      {
        title: "Compartilhamento de informações",
        paragraphs: [
          "A Ateliux não vende dados pessoais. Informações podem ser compartilhadas apenas quando necessário para execução dos serviços, cumprimento de obrigações legais, proteção de direitos ou integração com ferramentas essenciais ao projeto.",
          "Essas ferramentas podem incluir provedores de hospedagem, serviços de e-mail, plataformas de analytics, bancos de dados, sistemas de pagamento, APIs e outras tecnologias necessárias para a operação do projeto.",
        ],
      },
      {
        title: "Segurança e retenção",
        paragraphs: [
          "Adotamos medidas técnicas e organizacionais para proteger informações contra acesso não autorizado, perda, alteração ou uso indevido.",
          "Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política, obrigações legais, contratos, suporte, histórico comercial e melhoria dos serviços.",
        ],
        notice: [
          "Nenhum sistema é completamente imune a riscos, mas buscamos aplicar boas práticas de segurança em nossos processos e projetos.",
          "O cliente também deve proteger credenciais, acessos administrativos, senhas e informações sensíveis fornecidas durante o projeto.",
        ],
      },
      {
        title: "Direitos do titular",
        paragraphs: [
          "Você pode solicitar acesso, correção, atualização ou exclusão dos seus dados pessoais, quando aplicável, entrando em contato pelos canais oficiais da Ateliux.",
          "Também é possível solicitar a interrupção de comunicações comerciais, respeitando eventuais obrigações legais ou contratuais que exijam a manutenção de determinadas informações.",
        ],
      },
    ],
  },
} as const;