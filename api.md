# Ateliux API Audit

Auditoria documental dos projetos `frontend` e `admin`, realizada para orientar a futura integração com backend/API, banco de dados, autenticação, e-mail, storage e serviços externos.

Esta auditoria não implementa backend, banco, autenticação real, endpoints, dependências ou mudanças visuais.

## 1. Resumo executivo

O projeto Ateliux está dividido em dois apps Next.js:

- `frontend`: site público da Ateliux, blog, páginas institucionais, contato, login/criação de conta visual, Portal do Cliente em `/cliente` e uma área `/crm` legada/mockada.
- `admin`: dashboard administrativa interna para clientes, blog, newsletter, caixa de entrada, portal do cliente, calendário, funcionários, desempenho, folha, licenças e recrutamento.

Hoje, os dois apps trabalham sem backend real. Os dados vêm de arquivos estáticos em `content/`, `data/`, `types/` e de estados locais em componentes client-side. Formulários de contato, suporte, newsletter, login, aprovações, solicitações e CRUDs administrativos são demonstrativos.

O backend futuro deve ser a fonte de verdade para clientes, contas, projetos, portal, blog, suporte, caixa de entrada, newsletter, contato, arquivos, aprovações, cronograma, financeiro, notificações e logs. O `frontend` deve consumir APIs públicas e APIs autenticadas do cliente. O `admin` deve consumir APIs administrativas protegidas por autenticação e permissões.

## 2. Arquitetura esperada

Arquitetura recomendada:

```txt
/frontend  -> consome API pública e API autenticada do cliente
/admin     -> consome API administrativa autenticada
/backend   -> fonte de verdade dos dados e regras de negócio
/database  -> persistência relacional
/storage   -> arquivos, imagens, anexos, capas e recibos
/email     -> contato, suporte, convites, notificações e transacionais
```

Recomendação coerente com o estado atual:

- Backend: NestJS ou API dedicada equivalente.
- Banco: PostgreSQL.
- ORM: Prisma.
- Auth: sessão por cookie httpOnly ou JWT com refresh token, decidindo antes da implementação.
- Storage: Cloudinary, S3, R2 ou equivalente.
- E-mail: Gmail API, SMTP Gmail, Resend ou provider transacional.
- Uploads: endpoint de upload com storage externo e metadados persistidos no banco.
- API pública: blog publicado, contato, newsletter, preços/use cases se forem dinâmicos.
- API cliente: Portal do Cliente autenticado.
- API admin: dashboard administrativa autenticada com permissões.

## 3. Autenticação e autorização

### 3.1 Autenticação do cliente

Necessária para:

- login do cliente;
- criar conta;
- recuperar senha;
- acessar `/cliente`;
- ver somente projetos vinculados ao cliente logado;
- responder briefings;
- aprovar entregas;
- solicitar ajustes;
- abrir chamados;
- enviar e baixar arquivos;
- visualizar cronograma, financeiro, equipe e histórico.

Endpoints sugeridos:

```txt
POST /auth/client/login
POST /auth/client/register
POST /auth/client/logout
GET  /auth/client/me
POST /auth/client/forgot-password
POST /auth/client/reset-password
```

Observação atual: `frontend/components/auth/MockAuthProvider.tsx` guarda autenticação somente em estado React. Não há sessão persistente, middleware, cookies, provider real ou proteção efetiva de rotas.

### 3.2 Autenticação administrativa

Necessária para:

- login da equipe Ateliux;
- acessar `/admin`;
- gerenciar clientes;
- gerenciar projetos e Portal do Cliente;
- gerenciar blog/newsletter;
- responder suporte e caixa de entrada;
- manipular arquivos;
- visualizar financeiro;
- acessar logs e histórico.

Endpoints sugeridos:

```txt
POST /auth/admin/login
POST /auth/admin/logout
GET  /auth/admin/me
POST /auth/admin/forgot-password
POST /auth/admin/reset-password
```

### 3.3 Permissões administrativas

Permissões recomendadas:

```txt
admin: acesso total
project_manager: clientes, projetos, etapas, aprovações, briefings, cronograma, histórico
support: caixa de entrada, suporte, solicitações, anexos e respostas
editor: blog, categorias, mídia editorial e newsletter
finance: financeiro, cobranças, recibos e status de pagamento
designer_dev: previews, arquivos, etapas e aprovações
attendance: leads de contato, clientes, inbox e suporte
```

## 4. Entidades principais do banco

| Entidade | Função | Campos principais | Relações | Criado por | Visualiza | Manipula |
| --- | --- | --- | --- | --- | --- | --- |
| User | Identidade comum do sistema | id, name, email, passwordHash, role, status | ClientAccount/AdminUser | sistema/admin | cliente/admin | auth |
| AdminUser | Usuário interno Ateliux | id, userId, name, role, permissions, avatarUrl | User, AuditLog | admin | admin | admin |
| Client | Cliente/empresa atendida | id, name, company, email, phone, plan, status, responsibleId | ClientAccount, Project | admin | admin/cliente | admin |
| ClientAccount | Conta de acesso do cliente | id, clientId, userId, inviteStatus, lastAccess | Client, User | admin/auth | cliente/admin | admin/auth |
| Project | Projeto contratado | id, clientId, name, type, scope, status, progress, deadline, managerId | Client, stages, files, finance | admin | cliente/admin | admin |
| ProjectStage | Etapa do projeto | id, clientId, projectId, title, status, deadline, requiresApproval | Project, Approval | admin | cliente/admin | admin |
| Briefing | Briefing enviado/respondido | id, clientId, projectId, title, questions, status, response | Client, Project | admin/cliente | cliente/admin | admin/cliente |
| Approval | Aprovação de entrega | id, clientId, projectId, previewId, status, message, clientComment | Project, Preview | admin | cliente/admin | admin/cliente |
| Preview | Link/versão de prévia | id, clientId, projectId, title, url, version, status | Project, Approval | admin | cliente/admin | admin |
| ClientRequest | Solicitação do cliente | id, clientId, projectId, title, description, priority, status | Client, Project, InboxConversation | cliente/admin | cliente/admin | cliente/admin |
| SupportTicket | Chamado de suporte | id, clientId, subject, category, priority, status | InboxConversation, FileAsset | cliente/público/admin | cliente/admin | cliente/admin |
| InboxConversation | Conversa centralizada | id, clientId, projectId, channel, source, status, assigneeId | InboxMessage, Client | sistema/cliente/admin | admin/cliente | admin/cliente |
| InboxMessage | Mensagem da conversa | id, conversationId, senderType, senderId, body | InboxConversation, FileAsset | cliente/admin/sistema | admin/cliente | admin/cliente |
| FileAsset | Arquivo/anexo | id, clientId, projectId, url, name, size, mimeType, visibility | Client, Project, messages | cliente/admin | cliente/admin | cliente/admin |
| ScheduleEvent | Evento do cronograma | id, clientId, projectId, title, date, time, visibleToClient | Project | admin | cliente/admin | admin |
| FinanceRecord | Cobrança/recibo | id, clientId, projectId, amount, dueDate, status, receiptFileId | Client, Project, FileAsset | admin | cliente/admin | finance/admin |
| BlogPost | Artigo do blog | id, slug, title, content, status, authorId, publishedAt, coverFileId | BlogCategory, FileAsset | admin/editor | público/admin | editor/admin |
| BlogCategory | Categoria/tag editorial | id, name, slug | BlogPost | admin/editor | público/admin | editor/admin |
| NewsletterSubscriber | Assinante newsletter | id, email, name, origin, status, interests | BlogPost opcional | visitante/admin | admin | admin/editor |
| ContactLead | Lead de contato | id, name, email, phone, company, budget, message, status, source | InboxConversation opcional | visitante | admin | admin/attendance |
| Notification | Notificação interna/cliente | id, recipientId, type, title, readAt, entityRef | User, Project | sistema | admin/cliente | sistema |
| AuditLog | Trilha de auditoria | id, actorId, actorType, action, entityType, entityId, metadata | todas | sistema | admin | sistema |

## 5. Mapa do `/frontend`

| Rota | Finalidade | Dados atuais | API necessária | Auth | Impacto no admin |
| --- | --- | --- | --- | --- | --- |
| `/` | Entrada, redireciona/serve home conforme app | Página estática | nenhum ou GET CMS/home | não | baixo |
| `/inicio` | Home comercial | `content/home/*`, interações visuais | GET `/site/home`, POST lead via contato quando CTA enviar e-mail | não | gera lead em contato |
| `/use-cases` | Casos de uso e módulos | `content/use-cases`, `data/useCasesNavigation` | GET `/site/use-cases` se dinâmico | não | conteúdo pode ser editado futuramente |
| `/precos` | Planos e comparação | `content/pricing` | GET `/pricing/plans` se planos forem administráveis | não | admin financeiro/comercial |
| `/blog` | Lista posts publicados e newsletter | `content/blog/blog-content.ts` | GET `/blog/posts`, GET `/blog/categories`, POST `/newsletter/subscribe` | não | admin blog/newsletter |
| `/blog/[slug]` | Leitura do artigo | `content/blog`, comentários fake | GET `/blog/posts/:slug`, GET `/blog/posts/:slug/comments` opcional | não | admin blog |
| `/sobre` | Institucional | `content/about` | GET `/site/about` se editável | não | baixo |
| `/contato` | Formulário comercial | `content/contact`, `QuoteForm` local | POST `/contact`, POST `/uploads` para anexo | não | cria ContactLead e conversa/inbox |
| `/login` | Login visual cliente | `AuthForm`, `MockAuthProvider` | POST `/auth/client/login` | sim após login | libera portal |
| `/criar-conta` | Cadastro visual cliente | `AuthForm`, `MockAuthProvider` | POST `/auth/client/register` | não | pode criar conta/lead/convite |
| `/faq` | Perguntas frequentes | `content/faq` | GET `/site/faq` se editável | não | baixo |
| `/suporte` | Suporte público | `content/support`, `SupportRequestForm` local | POST `/support/tickets` ou POST `/contact/support` | não ou cliente opcional | cria ticket/inbox |
| `/design` | Design system/guia visual | `content/design`, componentes interativos locais | GET `/site/design-system` se editável | não | baixo |
| `/termos` | Termos legais | `content/legal` | GET `/legal/terms` se editável | não | baixo |
| `/privacidade` | Política legal | `content/legal` | GET `/legal/privacy` se editável | não | baixo |
| `/cliente` | Entrada do Portal do Cliente | layout local | GET `/auth/client/me`, redirect interno | sim | depende de conta cliente |
| `/cliente/visao-geral` | Resumo do projeto | `clientPortalUser`, projects, history | GET `/client/dashboard` | sim | reflete projetos/admin |
| `/cliente/projeto` | Dados do projeto atual | `clientProjects` | GET `/client/projects`, GET `/client/projects/:id` | sim | admin projetos |
| `/cliente/etapas` | Etapas do projeto | `clientStages` | GET `/client/projects/:projectId/stages` | sim | admin etapas |
| `/cliente/aprovacoes` | Aprovar/solicitar ajustes | `clientApprovals`, estado local | GET `/client/approvals`, POST approve/changes | sim | admin aprovações/inbox |
| `/cliente/solicitacoes` | Criar solicitações | `clientRequests`, estado local | GET `/client/requests`, POST `/client/requests` | sim | admin solicitações/inbox |
| `/cliente/arquivos` | Enviar/baixar arquivos | `clientFiles`, estado local | GET `/client/files`, POST `/client/files`, GET signed URL | sim | admin arquivos/storage |
| `/cliente/previa` | Ver previews | `clientPreviews` | GET `/client/previews` | sim | admin previews/aprovações |
| `/cliente/cronograma` | Cronograma visível | `clientScheduleEvents` | GET `/client/schedule` | sim | admin cronograma |
| `/cliente/suporte` | Tickets do cliente | `clientSupportTickets`, estado local | GET/POST `/client/support/tickets`, POST messages | sim | admin suporte/inbox |
| `/cliente/equipe` | Equipe Ateliux do projeto | `clientTeam` | GET `/client/team` | sim | admin projeto/equipe |
| `/cliente/financeiro` | Parcelas e recibos | `clientInvoices` | GET `/client/finance`, GET receipt signed URL | sim | admin financeiro |
| `/cliente/historico` | Histórico do projeto | `clientHistory` | GET `/client/history` | sim | admin histórico/audit |
| `/crm/*` | Área CRM legada/mock | `data/crm`, componentes `components/crm` | não priorizar; decidir migração ou remoção | sim se mantida | fora do Portal atual |

## 6. Mapa do `/admin`

| Rota | Finalidade administrativa | Dados atuais | CRUD necessário | Endpoints | Permissões |
| --- | --- | --- | --- | --- | --- |
| `/` | Entrada admin | página local | login/redirect futuro | GET `/auth/admin/me` | admin/equipe |
| `/dashboard` | Visão geral e views por query | `admin-mock-data` | leitura e ações por módulo | GET `/admin/dashboard` | admin |
| `/clientes` | Gestão de clientes | `ADMIN_CLIENTS`, estado local | criar, editar, excluir, inativar, vincular projeto, convidar | `/admin/clients` | admin/project_manager/attendance |
| `/blog` | Gestão editorial | `ADMIN_BLOG_POSTS`, estado local | criar, editar, duplicar, publicar, despublicar, arquivar, excluir | `/admin/blog/posts` | editor/admin |
| `/newsletter` | Assinantes newsletter | `NEWSLETTER_SUBSCRIBERS`, estado local | listar, editar status, exportar, remover | `/admin/newsletter/subscribers` | editor/admin |
| `/suporte` | Suporte legado/admin | `SUPPORT_TICKETS`, solicitações convertidas | responder, atualizar status, converter tarefa | `/admin/support/tickets` | support/admin |
| `/dashboard?view=inbox` | Caixa de Entrada | `ADMIN_INBOX_CONVERSATIONS` | criar conversa, responder, anexar, atribuir, status, excluir | `/admin/inbox/conversations` | support/admin |
| `/portal-do-cliente` | Entrada do portal admin | `PortalManagementView` | redirecionar/listar clientes | `/admin/portal/clients` | project_manager/admin |
| `/portal-do-cliente/clientes` | Clientes do Portal | `PORTAL_CLIENTS` | listar e acessar workspace | `/admin/portal/clients` | project_manager/admin |
| `/portal-do-cliente/clientes/[clientId]` | Workspace por cliente | mocks scoped | manipular módulos do cliente | endpoints por cliente | project_manager/admin |
| `/portal-do-cliente/projetos` | Projetos do portal | `PORTAL_PROJECTS_SCOPED` | criar, editar, enviar, avançar, arquivar/excluir | `/admin/clients/:clientId/projects` | project_manager/admin |
| `/portal-do-cliente/briefings` | Briefings por cliente | `PORTAL_BRIEFINGS` | criar, editar, enviar, arquivar, excluir | `/admin/briefings` | project_manager/admin |
| `/portal-do-cliente/etapas` | Etapas por projeto | `PORTAL_STAGES_SCOPED` | criar, editar, enviar, solicitar aprovação, concluir, excluir | `/admin/stages` | project_manager/designer_dev |
| `/portal-do-cliente/aprovacoes` | Aprovações | `PORTAL_APPROVALS_SCOPED` | criar, editar, enviar, aprovar manualmente, solicitar ajustes, excluir | `/admin/approvals` | project_manager/designer_dev |
| `/portal-do-cliente/solicitacoes` | Solicitações | `PORTAL_REQUESTS_SCOPED` | responder, editar status, converter em etapa, concluir, excluir | `/admin/requests` | support/project_manager |
| `/portal-do-cliente/arquivos` | Arquivos | `PORTAL_FILES_SCOPED` | enviar, receber, editar, baixar, excluir | `/admin/files`, `/uploads` | project_manager/support |
| `/portal-do-cliente/previews` | Previews | `PORTAL_PREVIEWS_SCOPED` | criar, editar, abrir, enviar para aprovação, arquivar, excluir | `/admin/previews` | designer_dev/project_manager |
| `/portal-do-cliente/cronograma` | Cronograma | `PORTAL_SCHEDULE_SCOPED` | criar, editar, mostrar/ocultar, reagendar, excluir | `/admin/schedule` | project_manager |
| `/portal-do-cliente/financeiro` | Financeiro | `PORTAL_FINANCE_SCOPED` | criar cobrança, marcar pago, emitir segunda via, atrasar, excluir | `/admin/finance` | finance/admin |
| `/portal-do-cliente/historico` | Histórico | `PORTAL_HISTORY_SCOPED` | listar, filtrar, criar nota manual, excluir | `/admin/history` | project_manager/admin |

## 7. Blog

### Frontend

O blog público usa `frontend/content/blog/blog-content.ts` e componentes em `frontend/components/blog`. A listagem, categorias, posts, conteúdo de artigo, artigos relacionados, quantidade de comentários fake, área de comentários e newsletter são estáticos ou simulados.

Necessário para API:

- listar posts publicados;
- buscar post por slug;
- categorias/tags;
- autor;
- capa/imagem;
- SEO;
- posts relacionados;
- comentários reais se forem mantidos;
- assinatura de newsletter.

### Admin

O admin usa `ADMIN_BLOG_POSTS` e `BlogManagementView`. As ações atuais são locais: criar, editar, duplicar, pré-visualizar, publicar/despublicar, arquivar e excluir.

Endpoints sugeridos:

```txt
GET    /blog/posts
GET    /blog/posts/:slug
GET    /blog/categories
POST   /admin/blog/posts
PATCH  /admin/blog/posts/:id
DELETE /admin/blog/posts/:id
POST   /admin/blog/posts/:id/publish
POST   /admin/blog/posts/:id/unpublish
POST   /admin/blog/posts/:id/archive
POST   /uploads/blog-cover
```

## 8. Newsletter

Fluxo desejado:

1. Usuário informa e-mail no frontend em `/blog`.
2. Backend valida e salva `NewsletterSubscriber`.
3. Admin visualiza em `/newsletter`.
4. Admin pode exportar, alterar status para ativo/descadastrado ou remover.
5. Futuramente novos posts podem disparar notificações.

Endpoints sugeridos:

```txt
POST   /newsletter/subscribe
POST   /newsletter/unsubscribe
GET    /admin/newsletter/subscribers
PATCH  /admin/newsletter/subscribers/:id
DELETE /admin/newsletter/subscribers/:id
GET    /admin/newsletter/subscribers/export
```

## 9. Contato e integração com Gmail

A página `/contato` usa `QuoteForm` com campos:

- nome;
- e-mail;
- telefone;
- empresa;
- tipo de projeto;
- orçamento;
- prazo;
- site atual;
- habilidades/necessidades;
- arquivo;
- mensagem;
- valores por query params, como e-mail/plano/assunto.

Hoje o envio apenas seta uma mensagem demonstrativa. O backend deve:

1. validar payload;
2. salvar `ContactLead`;
3. enviar e-mail para Ateliux;
4. opcionalmente criar `InboxConversation`;
5. permitir resposta pela admin ou registrar resposta externa.

Integrações possíveis:

- Gmail API;
- SMTP Gmail;
- Resend;
- outro provider transacional.

Endpoints sugeridos:

```txt
POST  /contact
GET   /admin/contact-leads
GET   /admin/contact-leads/:id
PATCH /admin/contact-leads/:id
POST  /admin/contact-leads/:id/convert-to-client
POST  /admin/contact-leads/:id/reply
```

Campos de `ContactLead`: name, email, phone, company, projectType, budget, timeline, currentSite, skills, message, fileAssetId, origin, status, responsibleId, createdAt.

## 10. Caixa de Entrada e Suporte

A Caixa de Entrada admin usa `ADMIN_INBOX_CONVERSATIONS`, já com `clientId` e `projectId` opcionais. O suporte público usa `/suporte` e `SupportRequestForm`. O suporte autenticado do cliente usa `/cliente/suporte`.

Fluxo correto:

- mensagens de clientes logados chegam no canal `clientes`;
- chamados públicos chegam em `suporte` ou viram lead/ticket;
- solicitações do Portal do Cliente também aparecem como conversa;
- comentários em aprovações podem virar conversa;
- respostas da equipe Ateliux voltam para o cliente no Portal do Cliente;
- anexos precisam ser armazenados em storage externo.

Endpoints admin:

```txt
GET    /admin/inbox/conversations
GET    /admin/inbox/conversations/:id
POST   /admin/inbox/conversations
POST   /admin/inbox/conversations/:id/messages
PATCH  /admin/inbox/conversations/:id/status
PATCH  /admin/inbox/conversations/:id/assignee
PATCH  /admin/inbox/conversations/:id/priority
DELETE /admin/inbox/conversations/:id
```

Endpoints cliente:

```txt
GET  /client/inbox/conversations
GET  /client/inbox/conversations/:id
POST /client/inbox/conversations/:id/messages
POST /client/support/tickets
POST /client/support/tickets/:id/messages
POST /client/support/tickets/:id/close
```

## 11. Portal do Cliente

Regra central: tudo precisa ser organizado por cliente. Nenhum item de portal deve ser global. Cada item deve possuir `clientId`, `projectId` quando aplicável, visibilidade para cliente, status e histórico.

### 11.1 Projetos

Frontend mostra projetos do cliente logado. Admin cria, edita, arquiva e controla visibilidade.

```txt
GET    /client/projects
GET    /client/projects/:id
GET    /admin/clients/:clientId/projects
POST   /admin/projects
PATCH  /admin/projects/:id
DELETE /admin/projects/:id
```

### 11.2 Briefings

Admin envia briefings para cliente específico. Cliente visualiza e responde.

```txt
GET    /client/briefings
GET    /client/briefings/:id
POST   /client/briefings/:id/response
GET    /admin/briefings
POST   /admin/briefings
PATCH  /admin/briefings/:id
POST   /admin/briefings/:id/send
DELETE /admin/briefings/:id
```

### 11.3 Etapas

Admin cria etapas e controla envio/status. Cliente acompanha somente etapas visíveis.

```txt
GET    /client/projects/:projectId/stages
GET    /admin/stages
POST   /admin/stages
PATCH  /admin/stages/:id
POST   /admin/stages/:id/send-to-client
POST   /admin/stages/:id/request-approval
DELETE /admin/stages/:id
```

### 11.4 Aprovações

Admin envia aprovação. Cliente aprova ou solicita ajustes.

```txt
GET    /client/approvals
POST   /client/approvals/:id/approve
POST   /client/approvals/:id/request-changes
GET    /admin/approvals
POST   /admin/approvals
PATCH  /admin/approvals/:id
POST   /admin/approvals/:id/send
DELETE /admin/approvals/:id
```

### 11.5 Solicitações

Cliente cria solicitação. Admin recebe no módulo de solicitações e na caixa de entrada.

```txt
GET    /client/requests
POST   /client/requests
GET    /admin/requests
PATCH  /admin/requests/:id
POST   /admin/requests/:id/reply
POST   /admin/requests/:id/convert-to-stage
```

### 11.6 Arquivos

Arquivos podem ser enviados pela Ateliux ou pelo cliente. Todos devem passar por storage.

```txt
GET    /client/files
POST   /client/files
GET    /admin/files
POST   /admin/files
PATCH  /admin/files/:id
DELETE /admin/files/:id
POST   /uploads
```

### 11.7 Previews

Admin cria link de preview e envia para aprovação. Cliente visualiza.

```txt
GET    /client/previews
GET    /admin/previews
POST   /admin/previews
PATCH  /admin/previews/:id
POST   /admin/previews/:id/send-for-approval
DELETE /admin/previews/:id
```

### 11.8 Cronograma

Admin monta cronograma. Cliente visualiza eventos marcados como visíveis.

```txt
GET    /client/schedule
GET    /admin/schedule
POST   /admin/schedule
PATCH  /admin/schedule/:id
DELETE /admin/schedule/:id
```

### 11.9 Financeiro

Admin cria e atualiza cobranças. Cliente visualiza parcelas, status e recibos.

```txt
GET    /client/finance
GET    /admin/finance
POST   /admin/finance
PATCH  /admin/finance/:id
DELETE /admin/finance/:id
GET    /client/finance/:id/receipt
```

### 11.10 Histórico

Admin e sistema geram histórico. Cliente visualiza histórico filtrado por seus projetos.

```txt
GET  /client/history
GET  /admin/history
POST /admin/history/manual-note
```

## 12. Clientes

`/admin/clientes` usa `ADMIN_CLIENTS` e `ClientsManagementView`. Atualmente permite alternar lista/kanban, ver detalhes, criar, editar, inativar, vincular projeto e excluir em estado local.

Dados necessários:

- dados cadastrais;
- empresa;
- plano;
- status do relacionamento;
- status da conta;
- responsável Ateliux;
- projeto vinculado;
- último acesso;
- progresso;
- notas internas.

Endpoints sugeridos:

```txt
GET    /admin/clients
GET    /admin/clients/:id
POST   /admin/clients
PATCH  /admin/clients/:id
DELETE /admin/clients/:id
POST   /admin/clients/:id/invite
PATCH  /admin/clients/:id/status
POST   /admin/clients/:id/projects/:projectId/link
```

## 13. Arquivos e storage

Pontos com upload/anexo:

- `/contato`: anexo de briefing/proposta;
- `/suporte`: anexo opcional;
- `/cliente/suporte`: anexo de ticket;
- `/cliente/arquivos`: arquivos enviados pelo cliente;
- admin arquivos do portal;
- anexos da caixa de entrada;
- imagens/capas do blog;
- recibos financeiros;
- documentos de briefing;
- arquivos de preview/protótipo.

Storage recomendado: Cloudinary para imagens e assets simples; S3/R2 para documentos, PDFs, zips e recibos; escolha uma estratégia antes da implementação.

Endpoints:

```txt
POST   /uploads
GET    /uploads/:id/signed-url
DELETE /uploads/:id
```

Regras:

- arquivo sempre deve ter owner/origin;
- `clientId` obrigatório para arquivos do portal;
- `projectId` opcional, mas recomendado quando o arquivo pertence a um projeto;
- controlar visibilidade para cliente;
- registrar mimeType, size, storageKey, url, uploadedBy, createdAt;
- anexos sensíveis devem usar URL assinada.

## 14. Notificações

Cliente deve ser notificado quando:

- novo briefing for enviado;
- etapa for publicada;
- aprovação for solicitada;
- arquivo for enviado;
- evento de cronograma for criado/reagendado;
- cobrança for criada ou vencer;
- chamado for respondido;
- comentário de aprovação receber resposta.

Admin deve ser notificado quando:

- cliente enviar solicitação;
- cliente responder briefing;
- cliente aprovar ou pedir ajuste;
- cliente abrir chamado;
- cliente enviar arquivo;
- novo lead de contato chegar;
- novo assinante newsletter chegar;
- financeiro precisar de atenção.

Canais:

- notificação interna;
- e-mail;
- futuramente WhatsApp.

Endpoints sugeridos:

```txt
GET   /client/notifications
PATCH /client/notifications/:id/read
GET   /admin/notifications
PATCH /admin/notifications/:id/read
```

## 15. Auditoria e logs

`AuditLog` deve registrar ações importantes:

- criou cliente;
- editou projeto;
- enviou briefing;
- cliente respondeu briefing;
- enviou preview;
- cliente aprovou entrega;
- cliente solicitou ajuste;
- respondeu chamado;
- marcou pagamento;
- excluiu arquivo;
- publicou artigo;
- alterou permissão;
- convidou cliente.

Campos:

```txt
actorId
actorType
action
entityType
entityId
clientId
projectId
timestamp
ipAddress
userAgent
metadata
```

Endpoints:

```txt
GET /admin/audit-logs
GET /admin/audit-logs/:id
```

## 16. Variáveis de ambiente

Frontend:

```txt
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_STORAGE_PUBLIC_URL=
```

Admin:

```txt
NEXT_PUBLIC_API_BASE_URL=
ADMIN_API_BASE_URL=
NEXT_PUBLIC_ADMIN_URL=
```

Backend:

```txt
DATABASE_URL=
JWT_SECRET=
COOKIE_SECRET=
CLIENT_APP_URL=
ADMIN_APP_URL=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
STORAGE_PROVIDER=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

## 17. Tabela de endpoints sugeridos

| Módulo | Método | Endpoint | Quem usa | Auth necessária | Permissão | Descrição |
| --- | --- | --- | --- | --- | --- | --- |
| Auth cliente | POST | `/auth/client/login` | frontend | não | pública | Login do cliente |
| Auth cliente | POST | `/auth/client/register` | frontend | não | pública | Cadastro/convite do cliente |
| Auth cliente | GET | `/auth/client/me` | frontend | sim | cliente | Sessão atual |
| Auth admin | POST | `/auth/admin/login` | admin | não | pública | Login equipe |
| Auth admin | GET | `/auth/admin/me` | admin | sim | equipe | Sessão admin |
| Blog | GET | `/blog/posts` | frontend | não | pública | Lista posts publicados |
| Blog | GET | `/blog/posts/:slug` | frontend | não | pública | Lê artigo |
| Blog admin | POST | `/admin/blog/posts` | admin | sim | editor/admin | Cria artigo |
| Blog admin | PATCH | `/admin/blog/posts/:id` | admin | sim | editor/admin | Edita artigo |
| Blog admin | DELETE | `/admin/blog/posts/:id` | admin | sim | editor/admin | Exclui artigo |
| Newsletter | POST | `/newsletter/subscribe` | frontend | não | pública | Assina newsletter |
| Newsletter admin | GET | `/admin/newsletter/subscribers` | admin | sim | editor/admin | Lista assinantes |
| Contato | POST | `/contact` | frontend | não | pública | Cria lead comercial |
| Leads admin | GET | `/admin/contact-leads` | admin | sim | attendance/admin | Lista leads |
| Suporte público | POST | `/support/tickets` | frontend | não | pública | Abre chamado público |
| Inbox admin | GET | `/admin/inbox/conversations` | admin | sim | support/admin | Lista conversas |
| Inbox admin | POST | `/admin/inbox/conversations/:id/messages` | admin | sim | support/admin | Responde conversa |
| Inbox cliente | GET | `/client/inbox/conversations` | frontend | sim | cliente | Lista conversas do cliente |
| Clientes admin | GET | `/admin/clients` | admin | sim | admin/project_manager | Lista clientes |
| Clientes admin | POST | `/admin/clients` | admin | sim | admin/project_manager | Cria cliente |
| Clientes admin | PATCH | `/admin/clients/:id` | admin | sim | admin/project_manager | Edita cliente |
| Portal projetos | GET | `/client/projects` | frontend | sim | cliente | Projetos do cliente |
| Portal projetos admin | POST | `/admin/projects` | admin | sim | project_manager | Cria projeto |
| Briefings cliente | POST | `/client/briefings/:id/response` | frontend | sim | cliente | Responde briefing |
| Briefings admin | POST | `/admin/briefings/:id/send` | admin | sim | project_manager | Envia briefing |
| Etapas cliente | GET | `/client/projects/:projectId/stages` | frontend | sim | cliente | Lista etapas |
| Etapas admin | POST | `/admin/stages/:id/send-to-client` | admin | sim | project_manager | Publica etapa |
| Aprovações cliente | POST | `/client/approvals/:id/approve` | frontend | sim | cliente | Aprova entrega |
| Aprovações cliente | POST | `/client/approvals/:id/request-changes` | frontend | sim | cliente | Solicita ajuste |
| Solicitações cliente | POST | `/client/requests` | frontend | sim | cliente | Cria solicitação |
| Solicitações admin | POST | `/admin/requests/:id/reply` | admin | sim | support/project_manager | Responde solicitação |
| Arquivos | POST | `/uploads` | frontend/admin | sim | cliente/equipe | Upload de arquivo |
| Arquivos cliente | GET | `/client/files` | frontend | sim | cliente | Lista arquivos |
| Arquivos admin | POST | `/admin/files` | admin | sim | project_manager | Envia arquivo ao cliente |
| Previews cliente | GET | `/client/previews` | frontend | sim | cliente | Lista previews |
| Previews admin | POST | `/admin/previews/:id/send-for-approval` | admin | sim | designer_dev | Envia preview |
| Cronograma cliente | GET | `/client/schedule` | frontend | sim | cliente | Eventos visíveis |
| Cronograma admin | POST | `/admin/schedule` | admin | sim | project_manager | Cria evento |
| Financeiro cliente | GET | `/client/finance` | frontend | sim | cliente | Lista cobranças |
| Financeiro admin | POST | `/admin/finance` | admin | sim | finance/admin | Cria cobrança |
| Histórico cliente | GET | `/client/history` | frontend | sim | cliente | Histórico do cliente |
| Histórico admin | POST | `/admin/history/manual-note` | admin | sim | project_manager | Nota manual |
| Notificações | GET | `/client/notifications` | frontend | sim | cliente | Notificações do cliente |
| Notificações admin | GET | `/admin/notifications` | admin | sim | equipe | Notificações admin |
| Auditoria | GET | `/admin/audit-logs` | admin | sim | admin | Logs do sistema |

## 18. Dados mockados que precisam virar API

| Arquivo | Tipo de dado | Entidade real | Endpoint futuro | Prioridade |
| --- | --- | --- | --- | --- |
| `frontend/data/client-portal/client-portal-mock-data.ts` | Portal completo do cliente | Client, Project, Stage, Approval, Request, FileAsset, Preview, ScheduleEvent, FinanceRecord, SupportTicket, History | `/client/*` | alta |
| `frontend/types/client-portal.ts` | Tipos do portal | contratos DTO | compartilhar com API/gerador | alta |
| `frontend/content/blog/blog-content.ts` | Posts/blog/newsletter | BlogPost, BlogCategory | `/blog/posts`, `/newsletter/subscribe` | alta |
| `frontend/content/contact/contact-content.ts` | Conteúdo/campos contato | ContactLead schema | `/contact` | alta |
| `frontend/content/support/support-content.ts` | Suporte público | SupportTicket | `/support/tickets` | alta |
| `frontend/content/auth/auth-content.ts` | Login/cadastro visual | Auth/client | `/auth/client/*` | alta |
| `frontend/content/pricing/pricing-content.ts` | Planos/preços | Plan/PricingConfig | `/pricing/plans` | média |
| `frontend/content/use-cases/use-cases-content.ts` | Casos de uso | SiteContent/UseCase | `/site/use-cases` | baixa/média |
| `frontend/content/home/*` | Home e demonstrações | SiteContent | `/site/home` | baixa |
| `frontend/content/about/about-content.ts` | Sobre | SiteContent | `/site/about` | baixa |
| `frontend/content/faq/faq-content.ts` | FAQ | FAQItem | `/site/faq` | baixa |
| `frontend/content/legal/legal-content.ts` | Termos/privacidade | LegalPage | `/legal/*` | baixa |
| `frontend/content/design/design-content.ts` | Design system público | SiteContent | `/site/design-system` | baixa |
| `frontend/data/crm/crm-mock-data.ts` | CRM legado | decidir manter/migrar | indefinido | baixa |
| `admin/data/admin/admin-mock-data.ts` | Admin inteiro | AdminUser, Client, BlogPost, NewsletterSubscriber, Portal*, SupportTicket, Inbox* | `/admin/*` | alta |
| `admin/types/admin.ts` | Tipos admin | contratos DTO | compartilhar/gerar | alta |
| `admin/data/admin/admin-navigation.ts` | Navegação admin | permissões/menu | `/admin/me/navigation` opcional | baixa |
| `frontend/components/contact/QuoteForm.tsx` | Estado local de contato | ContactLead | POST `/contact` | alta |
| `frontend/components/support/SupportRequestForm.tsx` | Estado local suporte | SupportTicket | POST `/support/tickets` | alta |
| `frontend/components/blog/BlogNewsletter.tsx` | Estado local newsletter | NewsletterSubscriber | POST `/newsletter/subscribe` | alta |
| `frontend/components/auth/MockAuthProvider.tsx` | Auth fake | Auth/session | `/auth/client/*` | alta |
| `admin/components/admin/views/*` | CRUD local admin | entidades administrativas | `/admin/*` | alta |

## 19. Prioridade de implementação

### Fase 1 - Base obrigatória

- Auth cliente.
- Auth admin.
- Clients.
- Projects.
- Portal básico do cliente.
- Blog público/admin.
- ContactLead.
- Newsletter.

### Fase 2 - Operação do Portal

- Briefings.
- Etapas.
- Aprovações.
- Solicitações.
- Inbox.
- Suporte.
- Arquivos e uploads.

### Fase 3 - Gestão avançada

- Previews.
- Cronograma.
- Financeiro.
- Histórico.
- Notificações.
- AuditLog.

### Fase 4 - Integrações

- Gmail API ou SMTP.
- Storage externo.
- E-mails transacionais.
- Analytics.
- Notificações externas.
- Exportações administrativas.

## 20. Riscos e decisões pendentes

- Usar JWT ou sessão por cookie httpOnly?
- Backend será NestJS dedicado, API routes Next ou outro serviço?
- Banco será PostgreSQL com Prisma?
- Storage será Cloudinary, S3, R2 ou outro?
- E-mail será Gmail API, SMTP Gmail, Resend ou outro provider?
- O sistema será multi-tenant ou operação única da Ateliux?
- Cliente pode ter múltiplos projetos ativos simultâneos?
- Cliente pode criar conta sozinho ou só por convite?
- Financeiro terá pagamento real ou apenas controle interno?
- Blog terá editor markdown, rich text ou campos simples?
- Comentários de blog serão reais, moderados ou apenas removidos?
- `/crm` no frontend será mantido, migrado para outro produto ou removido?
- Quais papéis administrativos serão definitivos?
- Quais ações exigem notificação por e-mail obrigatória?
- Qual nível de auditoria é obrigatório para financeiro e arquivos?

## 21. Conclusão

Indispensável para começar o backend:

- definir autenticação cliente/admin;
- criar modelos `Client`, `ClientAccount`, `Project`, `AdminUser`;
- migrar mocks de Portal do Cliente e admin para banco;
- conectar contato, suporte, newsletter e blog;
- criar storage para arquivos/anexos;
- garantir `clientId` em todo dado do Portal do Cliente.

Pode ficar para depois:

- edição dinâmica de páginas institucionais;
- CMS completo para home/use cases/design/FAQ;
- WhatsApp;
- analytics avançado;
- CRM legado de `/crm`, até decisão de produto.

Ordem recomendada:

1. Auth + Client/AdminUser.
2. Clients + Projects.
3. Portal básico por cliente.
4. ContactLead + Newsletter + Blog.
5. Briefings, etapas, aprovações, solicitações e inbox.
6. Arquivos/storage.
7. Financeiro, cronograma, histórico, notificações e logs.

Arquivos que devem ser atacados primeiro quando o backend começar:

- `frontend/components/auth/MockAuthProvider.tsx`;
- `frontend/data/client-portal/client-portal-mock-data.ts`;
- `frontend/components/contact/QuoteForm.tsx`;
- `frontend/components/support/SupportRequestForm.tsx`;
- `frontend/components/blog/BlogNewsletter.tsx`;
- `admin/data/admin/admin-mock-data.ts`;
- `admin/components/admin/views/PortalManagementView.tsx`;
- `admin/components/admin/views/InboxView.tsx`;
- `admin/components/admin/views/ClientsManagementView.tsx`;
- `admin/components/admin/views/BlogManagementView.tsx`;
- `admin/components/admin/views/NewsletterManagementView.tsx`.

Nenhuma implementação de backend foi feita nesta auditoria.
