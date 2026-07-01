# Ateliux E2E Testing

Testes E2E browser do ecossistema Ateliux.

## Framework

O harness usa Playwright na raiz do repositório:

```txt
playwright.config.ts
e2e/admin-client-project-flow.spec.ts
e2e/helpers/*
```

## Variáveis

Crie `.env.e2e` local ou exporte variáveis no terminal. Não versionar valores reais.

```env
E2E_BASE_API_URL=http://localhost:3001/api
E2E_ADMIN_URL=http://localhost:3002
E2E_FRONTEND_URL=http://localhost:3000
E2E_TARGET_ENV=local
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
E2E_CLIENT_PASSWORD=
E2E_START_SERVERS=false
E2E_ALLOW_NON_LOCAL=false
E2E_ALLOW_PRODUCTION=false
E2E_ALLOW_DESTRUCTIVE_TESTS=false
```

Se `E2E_ADMIN_EMAIL` e `E2E_ADMIN_PASSWORD` não forem definidos, o harness tenta usar `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` do `backend/.env` local. Esses valores nunca devem ser impressos em logs ou documentação.

## Segurança

- O E2E é bloqueado quando `NODE_ENV=production`.
- URLs precisam ser locais por padrão.
- Para apontar para staging, defina conscientemente `E2E_ALLOW_NON_LOCAL=true`.
- Não rode contra produção.
- Dados criados usam prefixo `E2E`.
- O teste não usa mock como fonte da verdade.
- O teste não intercepta `POST /admin/projects/full-setup`.

## Como Rodar

Com os três apps já rodando:

```bash
cd backend
npm run start:dev
```

```bash
cd admin
npm run dev -- -p 3002
```

```bash
cd frontend
npm run dev
```

Na raiz:

```bash
npm install
npx playwright install chromium
npm run e2e
```

Também existem:

```bash
npm run e2e:headed
npm run e2e:ui
```

Opcionalmente, `E2E_START_SERVERS=true` permite que o Playwright tente subir backend, admin e frontend via `webServer`.

## Cenários Cobertos

- Admin abre `/clientes`.
- Ação `Criar projeto para este cliente` navega para `/portal-do-cliente/projetos?clientId=<clientId>&create=1`.
- Cliente fica pré-selecionado e bloqueado no full setup.
- Projeto `visibleToClient=true` é criado via UI e `POST /admin/projects/full-setup`.
- Redirecionamento para `/portal-do-cliente/projetos/[projectId]`.
- F5 mantém o projeto na central admin.
- Cliente loga no Portal e vê projeto visível com responsável, etapa, progresso, prazo e resumo.
- Projeto `visibleToClient=false` persiste na admin, mas não aparece em `/client/projects`.
- Projeto incompleto sem responsável não mostra sucesso falso e o backend retorna `400`.
- Tela de clientes não exibe o fluxo operacional antigo de vínculo falso.

## Limitações

O harness atual cobre o fluxo crítico Admin -> Backend -> Portal do Cliente. Outros módulos visuais podem receber testes próprios depois, como blog, arquivos, inbox, financeiro e notificações.
 

## Rotina Oficial de Validacao

O E2E tambem faz parte da rotina oficial de validacao:

```bash
npm run validate:e2e
```

Esse comando usa `scripts/validate.mjs`, define `E2E_START_SERVERS=true` por padrao e reutiliza servidores existentes quando possivel.

Comandos principais:

```bash
npm run validate:all
npm run validate:pre-staging
npm run validate:pre-production
```

Relatorios sao gerados em:

```txt
docs/reports/*-validation-latest.md
```

Para alvo nao local, `E2E_ALLOW_NON_LOCAL=true` e `E2E_CLIENT_PASSWORD` sao obrigatorios. Para alvo de producao real, tambem e obrigatorio declarar `E2E_TARGET_ENV=production` e `E2E_ALLOW_PRODUCTION=true`.
