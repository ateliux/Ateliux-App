# Ateliux Backend

API central da Ateliux para o site público, Portal do Cliente e dashboard admin.

## Stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT com cookies httpOnly
- Redis
- BullMQ
- Cloudinary
- SMTP Gmail via Nodemailer
- Swagger/OpenAPI
- Zod e class-validator
- Rate limit global
- Logs estruturados e audit logs
- Docker Compose

## Arquitetura

```txt
src/
  config/          env e providers
  common/          decorators, guards, filters, interceptors, dto
  prisma/          PrismaModule e PrismaService
  auth/            login cliente/admin, JWT, cookies httpOnly
  clients/         clientes admin
  projects/        projetos cliente-first
  briefings/       briefings e respostas
  project-stages/  etapas
  approvals/       aprovações
  previews/        previews
  client-requests/ solicitações do cliente
  inbox/           conversas e mensagens
  support/         suporte público e autenticado
  files/           metadados de arquivos
  uploads/         Cloudinary preparado
  blog/            blog público e admin
  newsletter/      assinantes
  contact-leads/   contatos comerciais
  schedule/        cronograma
  finance/         financeiro
  notifications/   notificações
  audit-logs/      auditoria
  mail/            fila de e-mail
  storage/         provider Cloudinary
  cache/           Redis cache
  queues/          BullMQ processors
```

Todos os módulos do Portal do Cliente foram modelados com `clientId`, e `projectId` quando aplicável.

## Instalação

```bash
cd backend
npm install
```

## Ambiente

Crie o `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Variáveis principais:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ateliux?schema=public
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=change-me-cookie-secret
COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
AUTH_DEBUG=false
CLIENT_APP_URL=http://localhost:3000
ADMIN_APP_URL=http://localhost:3002
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_ROOT_FOLDER=ateliux
UPLOAD_MAX_GLOBAL_SIZE_MB=100
ADMIN_UPLOAD_MAX_SIZE_MB=100
BLOG_IMAGE_UPLOAD_MAX_SIZE_MB=8
UPLOAD_AUTO_APPROVE_ADMIN_SAFE_CONTEXTS=true
BOOTSTRAP_ADMIN_EMAIL=
BOOTSTRAP_ADMIN_NAME=
BOOTSTRAP_ADMIN_PASSWORD=
BOOTSTRAP_ADMIN_RESET_PASSWORD=false
ALLOW_DEMO_SEED=false
```

O backend não sobe se variáveis obrigatórias estiverem ausentes ou inválidas.

## Auth e Sessao

A sessao usa cookies httpOnly, separados por escopo:

```txt
admin: ateliux_admin_access_token, ateliux_admin_refresh_token
cliente: ateliux_client_access_token, ateliux_client_refresh_token
legado aceito durante migracao: ateliux_access_token, ateliux_refresh_token
```

`JWT_ACCESS_EXPIRES_IN` controla o token curto usado nas chamadas autenticadas. O padrao local recomendado e `15m`. `JWT_REFRESH_EXPIRES_IN` controla o refresh token persistido no banco. O padrao recomendado e `7d`.

Quando o access token expira, frontend e admin chamam `/auth/client/refresh` ou `/auth/admin/refresh` uma vez, rotacionam o refresh token e repetem a chamada original. `401` significa sessao ausente/expirada; `403` significa falta de permissao e nao deve derrubar o login. O refresh token e salvo no banco como SHA-256 do token bruto; hashes bcrypt antigos ainda sao aceitos durante migracao, mas novos tokens nao usam bcrypt para evitar truncamento de JWT longo.

Em desenvolvimento local, deixe `COOKIE_DOMAIN` vazio. Nao use `COOKIE_DOMAIN=localhost`, porque browsers podem rejeitar esse domain ou deixar cookies instaveis. O backend ignora `localhost` ao criar cookies e tambem tenta limpar cookies legados com e sem domain para recuperar navegadores que ja receberam configuracao antiga.

Use `AUTH_DEBUG=true` somente para depurar criacao/limpeza de cookies. Os logs nao devem expor tokens nem segredos.

## Docker

Subir PostgreSQL e Redis:

```bash
docker compose up -d postgres redis
```

Subir tudo, incluindo backend:

```bash
docker compose up -d
```

## Prisma

Gerar client:

```bash
npm run prisma:generate
```

Rodar migrations:

```bash
npm run prisma:migrate
```

Rodar seed demo local:

```bash
ALLOW_DEMO_SEED=true npm run prisma:seed:dev
```

O seed demo fica em `prisma/seed.dev.ts`, cria dados ficticios para desenvolvimento e aborta se `NODE_ENV=production` ou se `ALLOW_DEMO_SEED` nao estiver definido como `true`.

O seed demo cria:

- admin principal;
- admins com roles de gestor e suporte;
- clientes Marima, Bananinha Acai e Ateliux Demo;
- contas de cliente;
- projetos, etapas, briefing, aprovação, preview, solicitação;
- inbox, arquivos, cronograma, financeiro;
- post de blog;
- assinante de newsletter;
- notificação;
- audit logs.

Bootstrap seguro do admin principal:

```bash
npm run prisma:bootstrap-admin
```

O bootstrap le `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME` e `BOOTSTRAP_ADMIN_PASSWORD`, valida senha forte, cria ou atualiza somente o admin principal e nao cria clientes/projetos/arquivos demo. Ele so troca senha de admin existente com `BOOTSTRAP_ADMIN_RESET_PASSWORD=true`.

Producao deve usar `npx prisma migrate deploy` e `npm run prisma:bootstrap-admin`. Nao rode `npm run prisma:seed` nem `npm run prisma:seed:dev` em producao.

## Rodar Localmente

```bash
npm run start:dev
```

API:

```txt
http://localhost:3001/api
```

Swagger/OpenAPI:

```txt
http://localhost:3001/api/docs
```

## Comandos

```bash
npm run start
npm run start:dev
npm run build
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed:dev
npm run prisma:bootstrap-admin
npm run production:check-clean
```

## Seguranca de Uploads

Uploads reais passam por `src/uploads` antes de chegar ao storage. O pipeline exige autenticacao nas rotas internas, resolve o ator pela rota/guard, valida `clientId`/`projectId`, aplica limite global do Multer, valida a politica do contexto, gera `safeName` com UUID, envia o buffer para Cloudinary e salva somente metadados em `FileAsset`.

Existem duas politicas:

- Inbound restritiva: `CLIENT` e `PUBLIC`, para arquivos enviados por clientes ou visitantes para a Ateliux.
- Outbound administrativa: `ADMIN`, para arquivos enviados pela equipe Ateliux ao blog, frontend, portal ou cliente.

O backend nunca confia em `actorType` vindo do body. O ator vem de `ClientAuthGuard`, `AdminAuthGuard`, `JwtAuthGuard` ou da rota publica.

Rotas principais:

```txt
POST /api/client/uploads
POST /api/admin/uploads
POST /api/uploads/public
GET  /api/files/:id/signed-url
GET  /api/admin/files/pending-review
POST /api/admin/files/:id/approve
POST /api/admin/files/:id/reject
DELETE /api/admin/files/:id
```

Contextos restritivos de cliente/visitante:

| Contexto | Extensoes | Limite | Status inicial |
| --- | --- | --- | --- |
| `avatar` | `.jpg`, `.jpeg`, `.png`, `.webp` | 2 MB | `APPROVED` |
| `contact_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 5 MB | `PENDING_REVIEW` |
| `support_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 8 MB | `PENDING_REVIEW` |
| `client_file` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.doc`, `.docx` | 10 MB | `PENDING_REVIEW` |
| `approval_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 10 MB | `PENDING_REVIEW` |
| `briefing_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.doc`, `.docx` | 10 MB | `PENDING_REVIEW` |

No fluxo inbound, extensao, MIME informado e magic bytes precisam bater com a allowlist. Extensoes perigosas continuam bloqueadas:

```txt
.exe .bat .cmd .sh .js .mjs .cjs .ts .tsx .jsx .html .htm .svg .php .py .rb .jar .msi .apk .dmg .sql .env .zip .rar .7z .tar .gz
```

Contextos administrativos:

| Contexto | Politica admin | Limite | Roles | Status inicial |
| --- | --- | --- | --- | --- |
| `blog_cover` | imagens `.jpg`, `.jpeg`, `.jfif`, `.png`, `.webp`, `.avif`, `.gif` | 8 MB | `ADMIN`, `EDITOR`, `DESIGNER_DEV` | `APPROVED` |
| `blog_hero` | imagens `.jpg`, `.jpeg`, `.jfif`, `.png`, `.webp`, `.avif`, `.gif` | 8 MB | `ADMIN`, `EDITOR`, `DESIGNER_DEV` | `APPROVED` |
| `client_file` | ampla: documentos, zips, imagens, design files, videos curtos e formatos nao detectados | 100 MB | `ADMIN`, `PROJECT_MANAGER`, `DESIGNER_DEV`, `SUPPORT` | `APPROVED` |
| `approval_attachment` | ampla | 100 MB | `ADMIN`, `PROJECT_MANAGER`, `DESIGNER_DEV` | `APPROVED` |
| `briefing_attachment` | ampla | 100 MB | `ADMIN`, `PROJECT_MANAGER`, `DESIGNER_DEV` | `APPROVED` |
| `finance_receipt` | ampla | 20 MB | `ADMIN`, `FINANCE` | `APPROVED` |
| `preview_asset` | ampla | 100 MB | `ADMIN`, `PROJECT_MANAGER`, `DESIGNER_DEV` | `APPROVED` |
| `support_attachment` | ampla | 100 MB | `ADMIN`, `SUPPORT`, `PROJECT_MANAGER` | `APPROVED` |

No fluxo admin, arquivo vazio, tamanho acima do limite, nome invalido, `clientId` obrigatorio e `projectId` de outro cliente continuam falhando. Magic bytes sao usados quando detectaveis, mas formatos legitimos nao reconhecidos por `file-type` podem ser salvos com `detectedMime=null`.

`UPLOAD_MAX_GLOBAL_SIZE_MB` precisa ser igual ou superior ao maior contexto administrativo que voce quer aceitar, porque o Multer aplica esse limite antes da validacao por contexto. `ADMIN_UPLOAD_MAX_SIZE_MB` controla entregas amplas e `BLOG_IMAGE_UPLOAD_MAX_SIZE_MB` controla imagens de blog. Aumentar esses limites aumenta custo potencial de Cloudinary/storage/banda.

Todo upload calcula metadados no backend:

| `riskLevel` | `downloadMode` | Uso |
| --- | --- | --- |
| `SAFE_PREVIEW` | `INLINE_ALLOWED` | Imagens seguras e PDF podem abrir em preview/signed URL sem forcar anexo. |
| `DOWNLOAD_ONLY` | `ATTACHMENT_ONLY` | Documentos, zips, videos e design files devem ser baixados. |
| `HIGH_RISK_DOWNLOAD_ONLY` | `ATTACHMENT_ONLY` | HTML, JS, SVG, JSON, XML, scripts, executaveis e similares nunca devem renderizar inline. |

Cloudinary usa pastas isoladas por ambiente, contexto, cliente e projeto:

```txt
ateliux/{environment}/{context-folder}/client_{clientId}/project_{projectId}
```

Arquivos enviados por cliente/visitante entram como `PENDING_REVIEW` e podem ser aprovados ou rejeitados pelo admin. Arquivos enviados por admin entram como `APPROVED` nos contextos permitidos. O endpoint de signed URL valida permissao, bloqueia cliente de acessar arquivo de outro `clientId`, exige `APPROVED` para download do cliente e forca anexo quando `downloadMode=ATTACHMENT_ONLY`. `FileAsset` tambem ja possui campos de preparo para malware scan: `scanStatus`, `scanProvider`, `scannedAt` e `scanResult`.

Uploads para Cloudinary persistem `cloudinaryResourceType` (`image`, `video` ou `raw`) junto com `cloudinaryPublicId`, `secureUrl` e metadados do arquivo. Esse campo e usado para signed URL e para exclusao fisica com o `resource_type` correto.

Rejeitar arquivo (`POST /api/admin/files/:id/reject`) nao remove o asset do Cloudinary. A rejeicao apenas muda o status para `REJECTED`, registra auditoria/motivo e impede download do cliente.

Excluir arquivo (`DELETE /api/admin/files/:id`) e uma acao administrativa separada. O backend valida permissao, verifica se o arquivo ainda esta em uso como imagem de blog ou recibo financeiro, remove o asset fisico do Cloudinary com `cloudinary.uploader.destroy`, trata `not found` como sucesso idempotente e somente depois marca o `FileAsset` como `DELETED`, preenche `deletedAt` e limpa `secureUrl`/`url`. Se o Cloudinary falhar, o banco nao e marcado como deletado e a API retorna erro controlado. Anexos de inbox, solicitacoes e suporte permanecem no historico como removidos.

Na troca ou remocao de capa/hero de blog, o post desvincula primeiro o arquivo antigo e tenta excluir fisicamente o asset antigo apenas se ele virou orfao. Se o mesmo arquivo ainda estiver vinculado a outro post ou registro bloqueante, a exclusao fisica e ignorada/bloqueada para preservar o conteudo ativo.

Eventos de auditoria registrados:

```txt
FILE_UPLOAD_ATTEMPT
FILE_UPLOAD_REJECTED_VALIDATION
ADMIN_FILE_UPLOAD_ATTEMPT
ADMIN_FILE_UPLOAD_DENIED_BY_ROLE
CLIENT_FILE_UPLOADED
PUBLIC_FILE_UPLOADED
ADMIN_FILE_UPLOADED
ADMIN_FILE_DELIVERED_TO_CLIENT
ADMIN_FILE_DOWNLOAD_REQUESTED
FILE_APPROVED
FILE_REJECTED
FILE_DELETE_REQUESTED
FILE_STORAGE_DELETE_SUCCEEDED
FILE_STORAGE_DELETE_FAILED
FILE_DELETE_BLOCKED_IN_USE
FILE_DELETE_BLOCKED_PERMISSION
FILE_DELETED
FILE_SIGNED_URL_REQUESTED
UNAUTHORIZED_FILE_ACCESS_ATTEMPT
```

Arquivos `PENDING_REVIEW` disparam job BullMQ `file.pending_review.notification` na fila `uploads`, criando uma notificacao administrativa sem bloquear a resposta do upload.

### Cloudinary em dev, staging e producao

Use credenciais Cloudinary separadas por ambiente sempre que possivel. Em desenvolvimento, crie uma conta/projeto de teste no Cloudinary, copie `Cloud name`, `API key` e `API secret` para `.env`, mantenha `NODE_ENV=development` e confira os assets na pasta:

```txt
ateliux/development/{context}/client_{clientId}/project_{projectId}
```

Em staging, use `NODE_ENV=staging` e credenciais de staging:

```txt
ateliux/staging/{context}/client_{clientId}/project_{projectId}
```

Em producao, use somente credenciais produtivas no ambiente seguro:

```txt
ateliux/production/{context}/client_{clientId}/project_{projectId}
```

Para testar upload local:

1. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` e `CLOUDINARY_ROOT_FOLDER`.
2. Rode `npm run start:dev`.
3. Envie um arquivo por `POST /api/uploads` ou `POST /api/admin/uploads` no Swagger.
4. Verifique `cloudinaryPublicId` e `secureUrl` no retorno.
5. Delete assets de teste pelo endpoint admin ou pelo painel Cloudinary.

Nao use credenciais de producao em desenvolvimento.

### Malware Scan Futuro

O schema ja possui `scanStatus`, `scanProvider`, `scannedAt` e `scanResult`, com status `NOT_SCANNED`, `PENDING`, `CLEAN`, `INFECTED` e `FAILED`.

Tambem existe o contrato `MalwareScannerProvider` e o stub `MalwareScanService`. O comportamento atual e seguro por padrao:

- nenhum arquivo e marcado como `CLEAN` sem scan real;
- arquivos sensiveis continuam em `PENDING_REVIEW`;
- `scanStatus` permanece `NOT_SCANNED` ate integracao real;
- o ponto futuro e implementar `scanFile(file)` com um provider real e atualizar `scanStatus` em job BullMQ.

## Status de Integração

O backend está preparado para sustentar `frontend` e `admin`, mas ainda não está integrado aos apps existentes. Os mocks atuais de `/frontend` e `/admin` não foram removidos.
