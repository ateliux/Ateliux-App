# Banco Limpo de Pre-Producao

Guia seguro para preparar um banco limpo de staging/pre-producao sem tratar dados demo como producao.

## Caminho Recomendado

Prefira sempre um banco novo e vazio.

Fluxo:

```bash
cd backend
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:bootstrap-admin
npm run production:check-clean
```

Depois, na raiz:

```bash
npm run validate:pre-production
```

Esse caminho evita risco de apagar dados reais e garante que somente migrations versionadas e bootstrap admin sejam usados.

## Quando Usar Limpeza Demo

Use `production:clean-demo-data` apenas em:

- banco local controlado;
- staging descartavel;
- banco de pre-producao criado a partir de snapshot com demo conhecido.

Nao use em producao real. Nao use para apagar banco inteiro. Nao use para limpar dados que apenas "parecem teste".

## Dry-Run

Dry-run e o padrao e nao altera o banco:

```bash
npm run db:clean-demo:dry-run
```

Ele gera:

```txt
docs/reports/demo-cleanup-latest.md
```

O relatorio lista tabelas analisadas, marcadores encontrados, itens ignorados e a proxima acao.

## Apply

Aplicar limpeza exige confirmacao explicita:

PowerShell:

```powershell
$env:CONFIRM_CLEAN_DEMO_DATA='true'
$env:ALLOW_DEMO_CLEANUP='true'
$env:ALLOW_DEMO_CLEANUP_ENV='local'
$env:CLEAN_DEMO_DATA_MODE='apply'
npm run db:clean-demo:apply
```

Bash:

```bash
CONFIRM_CLEAN_DEMO_DATA=true \
ALLOW_DEMO_CLEANUP=true \
ALLOW_DEMO_CLEANUP_ENV=local \
CLEAN_DEMO_DATA_MODE=apply \
npm run db:clean-demo:apply
```

Para staging controlado, use:

```env
ALLOW_DEMO_CLEANUP_ENV=staging
```

## Protecoes

- `production:check-clean` continua somente leitura.
- `production:clean-demo-data` roda em `dry-run` por padrao.
- `apply` exige `CONFIRM_CLEAN_DEMO_DATA=true`.
- `apply` exige `ALLOW_DEMO_CLEANUP=true`.
- `apply` exige `ALLOW_DEMO_CLEANUP_ENV=local|staging`.
- `NODE_ENV=production` bloqueia limpeza.
- `DATABASE_URL` precisa estar definida.
- Host/banco com indicador `prod` ou `production` bloqueia `apply`.
- Dados E2E nao sao apagados por esse comando.
- Cloudinary fisico nao e apagado por esse comando.
- `BOOTSTRAP_ADMIN_EMAIL` e protegido quando definido.

## Marcadores Demo Considerados

O script so considera marcadores conhecidos do seed demo:

- clientes `ana@marima.com`, `bruno@bananinha.com`, `marina.demo@ateliux.com.br`;
- empresas `Marima`, `Bananinha Acai`, `Ateliux Demo`;
- projetos `E-commerce Marima`, `Site de pedidos`, `Portal Ateliux Demo`;
- preview `preview.ateliux.dev`;
- arquivos com `res.cloudinary.com/demo`, `ateliux/marima` ou `ateliux/bananinha`;
- blog slug `como-transformar-ideia-em-produto-digital`;
- newsletter `contato@marima.com`;
- financeiro `Parcela inicial do site de pedidos`;
- cronograma `Entrega da Home`;
- audit logs `seed.created` e `support.ready`.

Admins seed conhecidos (`admin@ateliux.com.br`, `gestor@ateliux.com.br`, `suporte@ateliux.com.br`) so entram na limpeza se `ALLOW_DEMO_ADMIN_CLEANUP=true` e nunca quando o e-mail for igual a `BOOTSTRAP_ADMIN_EMAIL`.

## Depois Da Limpeza

Rode:

```bash
npm run db:check-clean
npm run validate:pre-production
```

Se `production:check-clean` ainda falhar, o banco ainda nao esta pronto para pre-producao/producao.
