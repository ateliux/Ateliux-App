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
COOKIE_SECRET=change-me-cookie-secret
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
UPLOAD_MAX_GLOBAL_SIZE_MB=20
UPLOAD_AUTO_APPROVE_ADMIN_SAFE_CONTEXTS=true
```

O backend não sobe se variáveis obrigatórias estiverem ausentes ou inválidas.

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

Rodar seed:

```bash
npm run prisma:seed
```

O seed cria:

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

Credenciais locais do seed:

```txt
Admin: admin@ateliux.com.br / Ateliux@123456
Gestor: gestor@ateliux.com.br / Ateliux@123456
Suporte: suporte@ateliux.com.br / Ateliux@123456
Clientes: senha Cliente@123456
```

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
npm run prisma:seed
```

## Seguranca de Uploads

Uploads reais passam por `src/uploads` antes de chegar ao storage. O pipeline exige autenticacao nas rotas internas, valida `clientId`/`projectId`, aplica limite global do Multer, valida a politica do contexto, bloqueia extensoes perigosas, valida MIME informado, valida magic bytes com `file-type`, gera `safeName` com UUID, envia o buffer para Cloudinary e salva somente metadados em `FileAsset`.

Rotas principais:

```txt
POST /api/client/uploads
POST /api/admin/uploads
POST /api/uploads/public
GET  /api/files/:id/signed-url
GET  /api/admin/files/pending-review
POST /api/admin/files/:id/approve
POST /api/admin/files/:id/reject
```

Contextos e tipos aceitos:

| Contexto | Extensoes | Limite | Status inicial |
| --- | --- | --- | --- |
| `avatar` | `.jpg`, `.jpeg`, `.png`, `.webp` | 2 MB | `APPROVED` |
| `blog_cover` | `.jpg`, `.jpeg`, `.png`, `.webp` | 5 MB | `APPROVED` |
| `contact_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 5 MB | `PENDING_REVIEW` |
| `support_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 8 MB | `PENDING_REVIEW` |
| `client_file` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.doc`, `.docx` | 10 MB | `PENDING_REVIEW` |
| `approval_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 10 MB | `PENDING_REVIEW` |
| `briefing_attachment` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.doc`, `.docx` | 10 MB | `PENDING_REVIEW` |
| `finance_receipt` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 5 MB | `APPROVED` |
| `preview_asset` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | 15 MB | `PENDING_REVIEW` |

Extensoes sempre bloqueadas:

```txt
.exe .bat .cmd .sh .js .mjs .cjs .ts .tsx .jsx .html .htm .svg .php .py .rb .jar .msi .apk .dmg .sql .env .zip .rar .7z .tar .gz
```

Cloudinary usa pastas isoladas por ambiente, contexto, cliente e projeto:

```txt
ateliux/{environment}/{context-folder}/client_{clientId}/project_{projectId}
```

Arquivos sensiveis entram como `PENDING_REVIEW` e podem ser aprovados ou rejeitados pelo admin. O endpoint de signed URL valida permissao, bloqueia cliente de acessar arquivo de outro `clientId` e exige `APPROVED` para download do cliente. `FileAsset` tambem ja possui campos de preparo para malware scan: `scanStatus`, `scanProvider`, `scannedAt` e `scanResult`.

Eventos de auditoria registrados:

```txt
FILE_UPLOAD_ATTEMPT
FILE_UPLOAD_REJECTED_VALIDATION
FILE_UPLOADED
FILE_APPROVED
FILE_REJECTED
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
