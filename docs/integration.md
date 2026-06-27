# Ateliux Integration

Documento de execucao e validacao da integracao entre `backend`, `frontend` e `admin`.

## Apps e portas

- Backend: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Frontend publico/Portal do Cliente: `http://localhost:3000`
- Admin: `http://localhost:3002`

Use `localhost` no browser e nos testes locais. O cookie local usa dominio `localhost`; chamadas para `127.0.0.1` podem nao carregar a sessao.

## Variaveis

`backend/.env` minimo local:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ateliux?schema=public
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
COOKIE_SECRET=change-me-cookie-secret-32
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CLIENT_APP_URL=http://localhost:3000
ADMIN_APP_URL=http://localhost:3002
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
REDIS_HOST=localhost
REDIS_PORT=6379
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEV_FALLBACK=true
```

`admin/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
NEXT_PUBLIC_ENABLE_DEV_FALLBACK=true
```

`NEXT_PUBLIC_ENABLE_DEV_FALLBACK` deve existir somente em desenvolvimento local. Em producao, a ausencia da flag bloqueia uso silencioso de mocks e as telas exibem estado de erro/empty state quando a API falha.

## Banco e seed

Migration aplicada nesta etapa:

```txt
20260626200000_contact_lead_file_asset
```

Comandos usados:

```bash
cd backend
npm run prisma:generate
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
npm run prisma:seed
```

Seed validada e idempotente para os dados principais:

- 3 admins
- 3 clientes e 3 contas de cliente
- 3 projetos
- etapas, briefing, aprovacao, preview, arquivos, solicitacao, inbox, cronograma e financeiro
- blog publicado e newsletter inicial

Contas locais:

- Admin: `admin@ateliux.com.br` / `Ateliux@123456`
- Cliente: `ana@marima.com` / `Cliente@123456`
- Cliente com arquivo pendente na seed: `bruno@bananinha.com` / `Cliente@123456`

## Auth

O frontend usa:

- `POST /auth/client/login`
- `POST /auth/client/register`
- `POST /auth/client/logout`
- `GET /auth/client/me`

O admin usa:

- `POST /auth/admin/login`
- `POST /auth/admin/logout`
- `GET /auth/admin/me`

Os dois apps usam cookie httpOnly via `credentials: "include"` e nao armazenam token em `localStorage`.

## Fluxos validados por API

E2E real executado em `http://localhost:3001/api`:

- login cliente e `GET /auth/client/me`
- login admin e `GET /auth/admin/me`
- cliente lista arquivos
- admin lista arquivos pendentes
- cliente tenta baixar arquivo pendente e recebe `403`
- admin aprova arquivo
- cliente baixa arquivo aprovado via `GET /files/:id/signed-url`
- cliente cria solicitacao com anexo
- admin abre conversa vinculada pelo `inboxConversationId`
- admin responde pela inbox
- cliente recebe a resposta em `/client/requests`
- cliente abre chamado de suporte
- admin responde pela inbox
- cliente recebe a resposta em `/client/support/tickets`
- lead publico criado em `POST /contact`
- assinante criado em `POST /newsletter/subscribe`
- admin lista clientes em `GET /admin/clients`

Resumo do ultimo E2E:

```json
{
  "clientLogin": "bruno@bananinha.com",
  "adminRole": "ADMIN",
  "pendingDownloadBlocked": true,
  "approvedFileStatus": "APPROVED",
  "signedUrlAfterApproval": true,
  "requestHasAdminReply": true,
  "supportHasAdminReply": true,
  "contactLeadCreated": true,
  "newsletterCreated": true,
  "adminClientsCount": 3
}
```

## Upload e revisao

Portal do Cliente envia arquivos por upload seguro e o backend resolve `clientId` pela sessao.

Status reais:

- `PENDING_REVIEW`
- `APPROVED`
- `REJECTED`
- `DELETED`

Download no cliente usa `GET /files/:id/signed-url` somente para arquivo aprovado. Em ambiente local sem Cloudinary configurado, o backend usa a URL persistida do seed como fallback depois de validar permissao e status.

Admin revisa arquivos por:

- `GET /admin/files`
- `GET /admin/files/pending-review`
- `POST /admin/files/:id/approve`
- `POST /admin/files/:id/reject`
- `GET /files/:id/signed-url`
- `DELETE /admin/files/:id`

## Suporte, solicitacoes e inbox

`/cliente/suporte`:

- `GET /client/support/tickets`
- `POST /client/support/tickets`
- `POST /client/support/tickets/:id/messages`
- `POST /client/support/tickets/:id/close`

`/cliente/solicitacoes`:

- `GET /client/requests`
- `POST /client/requests`

Caixa de entrada admin:

- `GET /admin/inbox/conversations`
- `GET /admin/inbox/conversations/:id`
- `POST /admin/inbox/conversations/:id/messages`
- `PATCH /admin/inbox/conversations/:id`
- `DELETE /admin/inbox/conversations/:id`

O vinculo entre solicitacao/chamado e inbox usa `inboxConversationId` salvo na entidade principal.

## Contato, newsletter e blog

Contato:

- `POST /contact`
- `GET /admin/contact-leads`
- `GET /admin/contact-leads/:id`
- `PATCH /admin/contact-leads/:id`
- `POST /admin/contact-leads/:id/convert-to-client`
- `POST /admin/contact-leads/:id/reply`

Newsletter:

- `POST /newsletter/subscribe`
- `POST /newsletter/unsubscribe`
- `GET /admin/newsletter/subscribers`
- `PATCH /admin/newsletter/subscribers/:id`
- `DELETE /admin/newsletter/subscribers/:id`
- `GET /admin/newsletter/subscribers/export`

Blog API:

- `GET /blog/posts`
- `GET /blog/posts/:id`
- `GET /blog/categories`
- `GET /admin/blog/posts`
- `POST /admin/blog/posts`
- `PATCH /admin/blog/posts/:id`
- `DELETE /admin/blog/posts/:id`
- `POST /admin/blog/posts/:id/publish`
- `POST /admin/blog/posts/:id/unpublish`
- `POST /admin/blog/posts/:id/archive`

As telas publicas `/blog` e `/blog/[slug]` usam a API publica de blog. O conteudo local permanece somente como fallback de desenvolvimento quando `NEXT_PUBLIC_ENABLE_DEV_FALLBACK=true`. O CRUD visual de blog na admin usa a API administrativa com fallback apenas em desenvolvimento.

## Admin conectado

Conectado a API real com fallback explicito em desenvolvimento:

- Auth admin
- Clientes: listar, criar, editar, arquivar/inativar, alterar status e convite
- Caixa de Entrada
- Revisao de arquivos
- BlogManagementView: listar, criar, editar, publicar/despublicar, arquivar, duplicar e excluir
- NewsletterManagementView: listar, criar via subscribe, alterar status, exportar e remover
- PortalManagementView: clientes, projetos, briefings, etapas, aprovacoes, solicitacoes, arquivos, previews, cronograma, financeiro e historico com `clientId` e `projectId`

Ainda mockado ou parcialmente conectado:

- Dashboard geral
- Suporte legado administrativo
- Calendario, funcionarios, desempenho, folha, licencas e recrutamento

## Portal do Cliente conectado

Conectado a API real com fallback explicito em desenvolvimento:

- Auth cliente
- Arquivos
- Solicitacoes
- Suporte
- Meu projeto
- Etapas
- Aprovacoes
- Previews
- Cronograma
- Financeiro
- Historico
- Notificacoes do painel lateral e contador real no topbar
- Visao geral composta por projetos, arquivos, solicitacoes, aprovacoes, cronograma, financeiro, historico, notificacoes e equipe
- Equipe via `GET /client/team`
- Identidade/projeto exibidos no topbar via sessao e projetos reais

Ainda mockado ou parcialmente conectado:

- Conteudo institucional/CMS publico que ainda e estatico por design

## Fallbacks mockados

Fallbacks permanecem somente para desenvolvimento quando API ou sessao nao responder e quando `NEXT_PUBLIC_ENABLE_DEV_FALLBACK=true`:

- `frontend/components/client-portal/files/ClientFilesPage.tsx`
- `frontend/components/client-portal/requests/ClientRequestsPage.tsx`
- `frontend/components/client-portal/support/ClientSupportPage.tsx`
- `frontend/components/client-portal/project/ClientProjectPage.tsx`
- `frontend/components/client-portal/stages/ClientStagesPage.tsx`
- `frontend/components/client-portal/approvals/ClientApprovalsPage.tsx`
- `frontend/components/client-portal/preview/ClientPreviewPage.tsx`
- `frontend/components/client-portal/schedule/ClientSchedulePage.tsx`
- `frontend/components/client-portal/billing/ClientBillingPage.tsx`
- `frontend/components/client-portal/history/ClientHistoryPage.tsx`
- `frontend/components/client-portal/layout/ClientPortalNotifications.tsx`
- `frontend/components/client-portal/overview/ClientOverviewPage.tsx`
- `frontend/components/client-portal/team/ClientTeamPage.tsx`
- `frontend/app/blog/page.tsx`
- `frontend/app/blog/[slug]/page.tsx`
- `admin/components/admin/views/ClientsManagementView.tsx`
- `admin/components/admin/views/FileReviewView.tsx`
- `admin/components/admin/views/InboxView.tsx`
- `admin/components/admin/views/BlogManagementView.tsx`
- `admin/components/admin/views/NewsletterManagementView.tsx`
- `admin/components/admin/views/PortalManagementView.tsx`

Mocks ainda estruturais:

- `frontend/data/client-portal/client-portal-mock-data.ts`
- `frontend/content/blog/blog-content.ts`
- `frontend/data/crm/crm-mock-data.ts`
- `admin/data/admin/admin-mock-data.ts`

Esses mocks nao devem ser tratados como producao.

## Mapa de fallbacks e mocks restantes

| Projeto | Arquivo | Modulo | Tipo de fallback | Endpoint real equivalente | Status | Pode existir em dev? | Bloqueado em producao? | Acao necessaria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| frontend | `components/auth/MockAuthProvider.tsx` | Auth cliente | fallback visual de sessao | `/auth/client/*` | parcialmente conectado | sim, com flag | sim | remover provider mock quando auth estiver final |
| frontend | `components/client-portal/files/ClientFilesPage.tsx` | Arquivos | mock em falha de API | `/client/files`, `/uploads` | conectado | sim, com flag | sim | validar browser com storage real |
| frontend | `components/client-portal/requests/ClientRequestsPage.tsx` | Solicitacoes | mock em falha de API | `/client/requests` | conectado | sim, com flag | sim | adicionar testes browser |
| frontend | `components/client-portal/support/ClientSupportPage.tsx` | Suporte cliente | mock em falha de API | `/client/support/tickets` | conectado | sim, com flag | sim | adicionar testes browser |
| frontend | `components/client-portal/project/ClientProjectPage.tsx` | Projeto | mock em falha de API | `/client/projects`, `/client/projects/:id` | conectado | sim, com flag | sim | enriquecer DTO real com blocos de escopo |
| frontend | `components/client-portal/stages/ClientStagesPage.tsx` | Etapas | mock em falha de API | `/client/projects/:id/stages` | conectado | sim, com flag | sim | validar selecao multi-projeto |
| frontend | `components/client-portal/approvals/ClientApprovalsPage.tsx` | Aprovacoes | mock em falha de API | `/client/approvals` | conectado | sim, com flag | sim | persistir comentarios de preview se virar requisito |
| frontend | `components/client-portal/preview/ClientPreviewPage.tsx` | Previews | mock em falha de API | `/client/previews` | conectado | sim, com flag | sim | decidir persistencia de comentario de preview |
| frontend | `components/client-portal/schedule/ClientSchedulePage.tsx` | Cronograma | mock em falha de API | `/client/schedule` | conectado | sim, com flag | sim | validar eventos por projeto |
| frontend | `components/client-portal/billing/ClientBillingPage.tsx` | Financeiro | mock em falha de API | `/client/finance` | conectado | sim, com flag | sim | conectar recibo por signed URL |
| frontend | `components/client-portal/history/ClientHistoryPage.tsx` | Historico | mock em falha de API | `/client/history` | conectado | sim, com flag | sim | aumentar cobertura de audit log |
| frontend | `components/client-portal/layout/ClientPortalNotifications.tsx` | Notificacoes | mock em falha de API | `/client/notifications` | conectado | sim, com flag | sim | validar browser com contador real no topbar |
| frontend | `components/client-portal/overview/ClientOverviewPage.tsx` | Visao geral | mock em falha de API | composicao `/client/projects`, `/client/files`, `/client/requests`, `/client/approvals`, `/client/schedule`, `/client/finance`, `/client/history`, `/client/notifications`, `/client/team` | conectado | sim, com flag | sim | adicionar teste browser de dashboard |
| frontend | `components/client-portal/team/ClientTeamPage.tsx` | Equipe | mock em falha de API | `/client/team` | conectado | sim, com flag | sim | enriquecer avatar/cargo no backend se necessario |
| frontend | `content/blog/blog-content.ts` | Blog publico | conteudo local em fallback dev | `/blog/posts`, `/blog/posts/:id` | conectado | sim, com flag | sim | remover fallback local quando CMS/API estiver estavel |
| frontend | `data/crm/crm-mock-data.ts` | CRM legado | mock estrutural | indefinido | pendente | sim | nao aplicavel ainda | decidir remover ou virar produto |
| admin | `components/admin/views/ClientsManagementView.tsx` | Clientes | mock em falha de API | `/admin/clients` | conectado | sim, com flag | sim | validar permissoes por papel |
| admin | `components/admin/views/InboxView.tsx` | Inbox | mock em falha de API | `/admin/inbox/conversations` | conectado | sim, com flag | sim | completar criacao/anexo real |
| admin | `components/admin/views/FileReviewView.tsx` | Revisao de arquivos | mock em falha de API | `/admin/files` | conectado | sim, com flag | sim | validar storage real |
| admin | `components/admin/views/BlogManagementView.tsx` | Blog admin | mock em falha de API | `/admin/blog/posts` | conectado | sim, com flag | sim | criar upload de capa/editor final |
| admin | `components/admin/views/NewsletterManagementView.tsx` | Newsletter admin | mock em falha de API | `/admin/newsletter/subscribers` | conectado | sim, com flag | sim | ajustar export CSV final |
| admin | `components/admin/views/PortalManagementView.tsx` | Portal admin | fallback somente em falha controlada | `/admin/projects`, `/admin/briefings`, `/admin/stages`, `/admin/approvals`, `/admin/requests`, `/admin/files`, `/admin/previews`, `/admin/schedule`, `/admin/finance`, `/admin/history` | conectado | sim, com flag | sim | adicionar testes browser para acoes reais |
| admin | `data/admin/admin-mock-data.ts` | Modulos internos | mock estrutural | varios `/admin/*` | pendente | sim | nao aplicavel ainda | substituir dashboard, suporte legado e RH |

## Como testar localmente

1. Subir PostgreSQL e Redis.
2. Em `backend`: `npm install`, `npm run prisma:generate`, `npx prisma migrate deploy`, `npm run prisma:seed`, `npm run start:dev`.
3. Em `frontend`: `npm install`, `npm run dev`.
4. Em `admin`: `npm install`, `npm run dev -- -p 3002`.
5. Entrar no frontend em `/login` com um cliente da seed.
6. Validar `/cliente/visao-geral`, `/cliente/projeto`, `/cliente/equipe`, `/cliente/arquivos`, `/cliente/solicitacoes`, `/cliente/suporte`, `/cliente/etapas`, `/cliente/aprovacoes`, `/cliente/previa`, `/cliente/cronograma`, `/cliente/financeiro` e `/cliente/historico`.
7. Entrar na admin com `admin@ateliux.com.br`.
8. Validar clientes, inbox, revisao de arquivos, blog, newsletter e Portal do Cliente admin.

## Pendencias de migracao

- Criar tela admin dedicada para leads de contato ou integrar leads na inbox.
- Adicionar testes negativos por papel administrativo especifico alem do papel `ADMIN`.
- Configurar Cloudinary/SMTP reais antes de qualquer ambiente de staging.
