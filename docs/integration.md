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
```

`admin/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
```

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

As telas publicas de blog e o CRUD visual de blog na admin ainda mantem conteudo local/fallback visual ate migracao tela a tela.

## Admin conectado

Conectado a API real com fallback explicito em desenvolvimento:

- Auth admin
- Clientes: listar, criar, editar, arquivar/inativar, alterar status e convite
- Caixa de Entrada
- Revisao de arquivos

Ainda mockado ou parcialmente conectado:

- Dashboard geral
- PortalManagementView por secoes completas
- BlogManagementView visual
- NewsletterManagementView visual
- Suporte legado administrativo
- Calendario, funcionarios, desempenho, folha, licencas e recrutamento

## Portal do Cliente conectado

Conectado a API real com fallback explicito em desenvolvimento:

- Auth cliente
- Arquivos
- Solicitacoes
- Suporte

Ainda mockado ou parcialmente conectado:

- Visao geral
- Projeto
- Etapas
- Aprovacoes
- Previews
- Cronograma
- Financeiro
- Historico
- Equipe
- Notificacoes visuais do topbar

## Fallbacks mockados

Fallbacks permanecem somente para desenvolvimento quando API ou sessao nao responder:

- `frontend/components/client-portal/files/ClientFilesPage.tsx`
- `frontend/components/client-portal/requests/ClientRequestsPage.tsx`
- `frontend/components/client-portal/support/ClientSupportPage.tsx`
- `admin/components/admin/views/ClientsManagementView.tsx`
- `admin/components/admin/views/FileReviewView.tsx`
- `admin/components/admin/views/InboxView.tsx`

Mocks ainda estruturais:

- `frontend/data/client-portal/client-portal-mock-data.ts`
- `frontend/content/blog/blog-content.ts`
- `frontend/data/crm/crm-mock-data.ts`
- `admin/data/admin/admin-mock-data.ts`

Esses mocks nao devem ser tratados como producao.

## Como testar localmente

1. Subir PostgreSQL e Redis.
2. Em `backend`: `npm install`, `npm run prisma:generate`, `npx prisma migrate deploy`, `npm run prisma:seed`, `npm run start:dev`.
3. Em `frontend`: `npm install`, `npm run dev`.
4. Em `admin`: `npm install`, `npm run dev -- -p 3002`.
5. Entrar no frontend em `/login` com um cliente da seed.
6. Validar `/cliente/arquivos`, `/cliente/solicitacoes` e `/cliente/suporte`.
7. Entrar na admin com `admin@ateliux.com.br`.
8. Validar clientes, inbox e revisao de arquivos.

## Pendencias de migracao

- Conectar visualmente todas as secoes do Portal do Cliente aos endpoints ja existentes.
- Migrar `PortalManagementView` da admin por secao, preservando `clientId` e `projectId`.
- Migrar `BlogManagementView` e `NewsletterManagementView` para API real.
- Criar tela admin dedicada para leads de contato ou integrar leads na inbox.
- Adicionar testes negativos por papel administrativo especifico alem do papel `ADMIN`.
- Configurar Cloudinary/SMTP reais antes de qualquer ambiente de staging.
