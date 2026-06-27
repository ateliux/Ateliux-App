@AGENTS.md

# CLAUDE.md — Memória do Projeto Ateliux

## 1. Identidade do projeto

Este projeto é o frontend da Ateliux, empresa focada na criação de soluções digitais sob medida.

A Ateliux trabalha com:

- sites institucionais;
- landing pages;
- e-commerce;
- SaaS;
- dashboards;
- automações;
- CRM;
- backend e APIs;
- design systems;
- ecossistemas digitais personalizados.

## 2. Visão geral

O projeto começou como um site institucional e comercial, mas está evoluindo para uma plataforma com área autenticada para clientes.

O site público deve apresentar a Ateliux, explicar serviços, mostrar casos de uso, publicar artigos, captar leads, apresentar preços e transmitir autoridade.

A área `/cliente` é o Portal do Cliente Ateliux e deve futuramente:

- ser acessada apenas por clientes reais da Ateliux;
- permitir que clientes acompanhem exclusivamente projetos contratados com a Ateliux;
- permitir acompanhamento de etapas, aprovações, solicitações, arquivos, cronograma, suporte, equipe, financeiro e histórico;
- ser protegida por autenticação real em uma etapa futura.

## 3. Estado atual do projeto

Atualmente, o projeto:

- possui frontend visualmente avançado, navegável e responsivo;
- usa componentes organizados por domínio;
- possui páginas públicas, autenticação visual e Portal do Cliente funcional no frontend;
- ainda usa dados mockados no Portal do Cliente;
- ainda possui formulários e fluxos demonstrativos;
- não possui backend, banco de dados, autenticação real, admin ou proteção real de rotas.

Não tratar mocks, formulários visuais ou telas de autenticação como funcionalidades reais de produção.

## 4. Stack atual

- Next.js 16 com App Router;
- React 19;
- TypeScript;
- Tailwind CSS 4;
- `lucide-react`;
- `framer-motion`;
- ESLint com `eslint-config-next`;
- conteúdo estruturado em `content/`;
- dados e navegação em `data/`;
- componentes por domínio em `components/`.

Não inventar dependências ou ferramentas que não estejam confirmadas em `package.json`.

## 5. Rotas públicas

- `/`: entrada raiz do site.
- `/inicio`: página inicial comercial.
- `/use-cases`: casos de uso, módulos e conteúdos relacionados.
- `/precos`: planos, comparação e perguntas frequentes.
- `/blog`: listagem editorial de artigos.
- `/blog/[slug]`: leitura individual de artigo.
- `/sobre`: apresentação institucional e especialidades.
- `/design`: design system e demonstração de componentes.
- `/contato`: captação de leads e solicitação de orçamento.
- `/termos`: termos de uso.
- `/privacidade`: política de privacidade.
- `/login`: tela visual de login, sem autenticação real.
- `/criar-conta`: tela visual de cadastro, sem autenticação real.

## 6. Rotas do Portal do Cliente

- `/cliente`: redireciona para `/cliente/visao-geral`.
- `/cliente/visao-geral`: resumo do projeto contratado.
- `/cliente/projeto`: briefing, escopo, funcionalidades e entregáveis.
- `/cliente/etapas`: timeline do processo Ateliux.
- `/cliente/aprovacoes`: aprovar entregas ou solicitar ajustes.
- `/cliente/solicitacoes`: registrar mudanças e novas ideias.
- `/cliente/arquivos`: central de materiais do projeto.
- `/cliente/previa`: páginas liberadas para revisão.
- `/cliente/cronograma`: entregas, reuniões e prazos.
- `/cliente/suporte`: tickets e mensagens com a Ateliux.
- `/cliente/equipe`: profissionais envolvidos no projeto.
- `/cliente/financeiro`: plano, parcelas e recibos mockados.
- `/cliente/historico`: linha do tempo completa do projeto.

`/crm` existe apenas como compatibilidade e redireciona para `/cliente/visao-geral`. As subrotas antigas podem permanecer temporariamente durante a migração, mas não representam mais a direção do produto.

## 7. Estrutura de pastas

- `app/`
  - rotas Next.js App Router;
  - layouts por grupo ou área;
  - páginas públicas e Portal do Cliente.
- `components/`
  - componentes separados por domínio;
  - exemplos: `home`, `blog`, `use-cases`, `pricing`, `about`, `design`, `contact`, `auth`, `legal` e `crm`.
- `content/`
  - textos e conteúdo editorial estruturado;
  - textos grandes não devem ficar hardcoded em componentes.
- `data/`
  - navegação, rotas, mocks e dados estruturais;
  - mocks do Portal do Cliente ficam em `data/client-portal`.
- `types/`
  - tipos compartilhados, especialmente tipos do CRM.
- `lib/`
  - utilidades futuras;
  - não criar abstrações grandes sem necessidade real.
- `public/`
  - assets públicos.

## 8. Direção visual

- Páginas públicas com visual clean, branco, espaçoso e corporativo.
- CTAs principais em preto.
- Cards com bordas suaves e sombras discretas.
- Textos principalmente em slate e gray.
- Blog com tema dark e visual editorial.
- Portal do Cliente com tema claro, usando a identidade global da Ateliux em preto, branco e cinza.
- Verde, amarelo e vermelho usados principalmente para estados semânticos.
- Design premium, objetivo e sem poluição visual.

A logo global da Ateliux deve ser reutilizada em vez de letras ou marcas provisórias.

## 9. Padrões de componentes

- Componentes devem ser pequenos, claros e focados.
- Páginas devem importar componentes, evitando arquivos gigantes.
- Textos editoriais devem ir para `content`.
- Dados mockados e estruturais devem ir para `data`.
- Tipos compartilhados devem ir para `types`.
- Componentes compartilhados globais devem ir para `components/ui`.
- Componentes específicos devem ficar dentro da pasta de seu domínio.
- Client Components devem ser usados apenas quando necessário.

## 10. Navegação e CTAs

- CTAs comerciais devem levar para `/contato`.
- CTAs de preço devem levar para `/contato` e podem usar query params.
- CTAs de design devem levar para `/design`.
- CTAs de casos de uso devem levar para `/use-cases`.
- Cards do blog devem levar para `/blog/[slug]`.
- Links legais devem levar para `/termos` e `/privacidade`.
- `/login` e `/criar-conta` existem, mas ainda não possuem autenticação real.
- Navegação interna deve usar `Link` do Next.js.

## 11. Portal do Cliente futuro

O Portal do Cliente deve evoluir para uma área protegida com dados isolados por cliente, login e sessão reais, permissões, projetos, aprovações, arquivos, solicitações, notificações, suporte e integração com backend.

O portal não é um CRM genérico nem um SaaS público. Ele é a área onde clientes reais acompanham projetos contratados com a Ateliux.

## 12. Backend futuro

O projeto ainda não possui backend.

Uma arquitetura futura possível, ainda não confirmada, inclui:

- backend próprio, possivelmente NestJS;
- banco PostgreSQL;
- Prisma ORM, caso essa decisão seja confirmada;
- autenticação e autorização;
- APIs para leads, clientes, projetos, etapas, aprovações, solicitações, arquivos, notificações e Portal do Cliente;
- admin interno da Ateliux.

Não implementar backend, banco, APIs ou autenticação sem comando explícito.

## 13. Admin futuro

Pode existir futuramente um admin interno para gerenciar clientes, liberar acesso ao Portal do Cliente, acompanhar leads, atualizar projetos, visualizar suporte e controlar usuários e permissões.

Ainda não existe módulo admin neste momento.

## 14. Pontos de atenção

- Login e cadastro são visuais.
- Portal do Cliente é funcional no frontend, mas todos os dados continuam mockados.
- Formulários ainda podem não enviar dados reais.
- Termos e privacidade precisam de revisão jurídica.
- Dados mockados não devem ser tratados como dados de produção.
- A área `/cliente` precisa ser protegida antes de uso real.
- Não introduzir persistência falsa para simular backend.
- Header e Footer públicos não devem aparecer dentro do Portal do Cliente.

## 15. Princípios do projeto

- Preservar a estrutura organizada.
- Não reescrever páginas aprovadas sem necessidade.
- Manter o design premium e consistente.
- Separar conteúdo, dados, tipos e UI.
- Não misturar a área pública com o CRM.
- Evitar componentes gigantes.
- Fazer mudanças pequenas e controladas.
- Sempre validar TypeScript, lint e build após alterações relevantes.
- Evoluir o produto em fases.
