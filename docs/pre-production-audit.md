# Ateliux Pre-Production Audit

Auditoria operacional antes de colocar o ecossistema Ateliux em staging/producao.

## Estado atual

- Backend NestJS com Prisma, PostgreSQL, Redis/BullMQ, auth por cookie httpOnly, modulos de portal, admin, uploads, contato, newsletter e blog.
- Migration `20260626200000_contact_lead_file_asset` aplicada com `prisma migrate deploy`.
- Seed idempotente validada para admins, clientes, projetos, arquivos, requests, inbox, portal, blog e newsletter.
- E2E por API validou cliente, admin, revisao de arquivo, solicitacoes, suporte, contato e newsletter.
- Frontend e admin ainda possuem fallbacks mockados em modulos nao totalmente migrados.

## Checklist obrigatorio

### Banco

- `npx prisma migrate status` deve retornar banco atualizado.
- Rodar `npm run prisma:seed` somente em ambiente local/dev.
- Verificar backups antes de staging/producao.
- Confirmar que `DATABASE_URL` nao aponta para banco local em deploy.

### Auth e cookies

- `COOKIE_SECRET`, `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` devem ser fortes e exclusivos por ambiente.
- `COOKIE_DOMAIN` deve bater com o dominio real.
- Em HTTPS, usar `COOKIE_SECURE=true`.
- Se frontend/admin estiverem em dominios diferentes, revisar `COOKIE_SAME_SITE=none` com HTTPS.
- Confirmar que frontend e admin usam `credentials: "include"`.
- Nao armazenar JWT em `localStorage`.

### CORS

- `CLIENT_APP_URL`, `ADMIN_APP_URL` e `CORS_ORIGINS` precisam conter somente dominios permitidos.
- Nao liberar wildcard com credenciais.
- Testar login cliente e admin pelo browser real, nao apenas por API.

### Uploads e storage

- Configurar Cloudinary ou storage definitivo antes de staging.
- Sem Cloudinary configurado, upload real retorna erro controlado; signed-url usa fallback somente para assets de seed com URL persistida.
- Validar limite de tamanho, extensoes, MIME real e rejeicao de arquivos perigosos.
- Confirmar que arquivo `PENDING_REVIEW` nao gera download para cliente.
- Confirmar que arquivo `REJECTED` e `DELETED` nao gera download.

### E-mail

- Configurar SMTP/Gmail/Resend real.
- Testar envio de contato, suporte, convite e notificacoes.
- Definir remetente oficial e politica de resposta.

### Redis e filas

- Redis deve estar disponivel antes do backend.
- Monitorar filas de upload/e-mail.
- Definir estrategia de retry e dead-letter antes de producao.

### Permissoes

- Validado: ADMIN acessa endpoints administrativos e cliente so acessa seus arquivos.
- Validado: cliente nao baixa arquivo pendente.
- Pendente: testes negativos completos para `PROJECT_MANAGER`, `SUPPORT`, `EDITOR`, `FINANCE` e demais papeis.
- Pendente: matriz final de permissoes por tela admin.

### Frontend

- Login/cadastro visual integrado ao backend.
- Portal conectado em arquivos, solicitacoes e suporte.
- Pendente migrar visao geral, projeto, etapas, aprovacoes, previews, cronograma, financeiro, historico, equipe e notificacoes.
- Remover fallback mockado antes de producao ou bloquear por flag clara de desenvolvimento.

### Admin

- Clientes, inbox e revisao de arquivos conectados.
- Pendente migrar dashboard, PortalManagementView por modulo, blog/newsletter visual, suporte legado e modulos internos.
- Fallback mockado deve ficar indisponivel em producao.

### Blog e newsletter

- API de blog e newsletter existe.
- Newsletter publica validada por API.
- Pendente ligar telas visuais de blog/admin blog ao backend.
- Definir se comentarios de blog serao reais, moderados ou removidos.

### Observabilidade

- Manter logs de request sem expor token/cookie.
- Registrar `AuditLog` para acoes sensiveis.
- Configurar monitoramento de erro e uptime.
- Definir politica de retencao de logs.

## Comandos de validacao

Backend:

```bash
cd backend
npm run prisma:generate
npx prisma migrate status
npm run typecheck
npm run lint
npm run build
npm run test
```

Frontend:

```bash
cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

Admin:

```bash
cd admin
npm run typecheck
npm run lint
npm run build
```

## Bloqueios para producao

- Configurar storage real.
- Configurar e-mail real.
- Remover ou bloquear fallback mockado em producao.
- Completar migracao visual dos modulos principais do Portal do Cliente e admin.
- Criar testes de permissao por papel.
- Validar CORS/cookies nos dominios reais.
- Rodar auditoria de dependencias.

## Itens aceitos temporariamente em desenvolvimento

- Fallback local para assets de seed quando Cloudinary nao esta configurado.
- Dados mockados para telas ainda nao migradas.
- Testes E2E por API sem automacao browser completa.
