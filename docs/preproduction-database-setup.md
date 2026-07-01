# Ateliux Preproduction Database Setup

Guia para provisionar um banco limpo de pre-producao/staging do ecossistema Ateliux.

## Ambiente

Nome recomendado:

```txt
preproduction
```

Banco conceitual:

```txt
database: ateliux_preproduction
user: ateliux_preproduction_user
port: 5432
ssl: required quando o provedor exigir
```

Nao registrar senha real neste documento.

## Local, Staging, Pre-Producao e Producao

- Local: ambiente de desenvolvimento em `localhost`, pode conter seed demo e dados E2E.
- Staging: ambiente compartilhado para QA, deve usar banco isolado e pode ser recriado.
- Pre-producao: ambiente mais proximo da producao, sem seed demo, com migrations reais e bootstrap admin.
- Producao: ambiente final, com dominios reais, dados reais, backup e monitoramento.

Pre-producao nao deve reutilizar o banco local com dados demo.

## Criacao Do Banco Limpo

Fluxo recomendado:

```bash
cd backend
npm ci
npm run prisma:generate
npx prisma migrate deploy
npx prisma migrate status
npm run prisma:bootstrap-admin
npm run production:check-clean
```

Depois, na raiz:

```bash
npm run validate:pre-production
```

Regras:

- usar somente `npx prisma migrate deploy`;
- nao usar `prisma migrate dev`;
- nao usar `prisma migrate reset`;
- nao rodar `npm run prisma:seed` ou `npm run prisma:seed:dev`;
- executar `prisma:bootstrap-admin` somente com credenciais fortes;
- validar `production:check-clean` antes de qualquer release.

## Env De Pre-Producao

Arquivos de exemplo:

```txt
backend/.env.preproduction.example
frontend/.env.preproduction.example
admin/.env.preproduction.example
.env.e2e.preproduction.example
```

Valores obrigatorios:

- `NODE_ENV=staging`;
- `COOKIE_SECURE=true`;
- `COOKIE_DOMAIN` coerente com o dominio;
- `COOKIE_SAME_SITE=none` quando houver cross-site;
- `ALLOW_DEMO_SEED=false`;
- `NEXT_PUBLIC_ENABLE_DEV_FALLBACK=false`;
- `CORS_ORIGINS` restrito;
- `DATABASE_URL` nao local;
- secrets fortes e exclusivos.

## Validacao De Ambiente

Antes de migrar, conferir:

- `DATABASE_URL` nao aponta para localhost;
- `CORS_ORIGINS` nao usa `*`;
- `COOKIE_SECURE=true`;
- `COOKIE_DOMAIN` nao e `localhost`;
- `ALLOW_DEMO_SEED=false`;
- `NEXT_PUBLIC_ENABLE_DEV_FALLBACK=false`;
- `NODE_ENV` nao e `development`;
- `COOKIE_SAME_SITE=none` sempre acompanha `COOKIE_SECURE=true`.

## E2E Em Pre-Producao Controlada

Use `.env.e2e.preproduction.example` como base local privada.

Regras:

- `E2E_ALLOW_NON_LOCAL=true` para staging/pre-producao;
- `E2E_ALLOW_PRODUCTION=false`;
- nao rodar contra producao real;
- criar apenas dados com prefixo E2E;
- nao limpar dados sem flag destrutiva explicita.

## Health Check

Validar:

```txt
GET /api/health
```

Resultado esperado:

```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok"
}
```

## Primeiro Cliente Real

Checklist:

- admin loga com bootstrap admin;
- admin abre `/clientes`;
- admin cria cliente real;
- admin cria projeto para este cliente;
- full setup usa backend real;
- projeto `visibleToClient=true` aparece no Portal;
- projeto `visibleToClient=false` nao aparece;
- F5 mantem dados.

## Relatorio

A validacao deve gerar:

```txt
docs/reports/preproduction-database-validation-latest.md
```

Esse relatorio nao deve conter secrets.

## Validacao Controlada Local

Foi executada uma validacao com banco PostgreSQL limpo e isolado, criado somente para rehearsal local:

```txt
ateliux_preproduction_validation_20260630181604
```

Resultado:

- migrations aplicadas com `npx prisma migrate deploy`;
- `npx prisma migrate status` retornou schema atualizado;
- `prisma:bootstrap-admin` criou apenas o admin principal;
- `production:check-clean` passou antes do E2E;
- `validate:pre-production` passou;
- health check retornou 200;
- E2E Playwright passou dentro de `validate:pre-production`;
- nenhum seed demo foi executado;
- nenhuma limpeza foi aplicada.

Relatorios:

```txt
docs/reports/preproduction-database-validation-latest.md
docs/reports/pre-production-validation-latest.md
```

Decisao: validacao local limpa passou. Para considerar pre-producao real pronta, repetir o mesmo fluxo com `DATABASE_URL` nao local, `NODE_ENV=staging`, dominios reais e validacao estrita de ambiente.
