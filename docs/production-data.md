# Ateliux Production Data

Guia para iniciar producao com banco limpo, sem dados demo e sem senhas padrao.

## Regra principal

Producao nao usa seed demo.

Em producao, nunca rode:

```bash
npm run prisma:seed
npm run prisma:seed:dev
npx prisma migrate dev
```

Use somente migrations de deploy e bootstrap seguro do admin principal.

## Comandos de producao limpa

```bash
cd backend
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:bootstrap-admin
npm run production:check-clean
npm run build
npm run start
```

Antes de `npm run prisma:bootstrap-admin`, configurar no ambiente seguro do provedor:

```env
BOOTSTRAP_ADMIN_EMAIL=
BOOTSTRAP_ADMIN_NAME=
BOOTSTRAP_ADMIN_PASSWORD=
BOOTSTRAP_ADMIN_RESET_PASSWORD=false
ALLOW_DEMO_SEED=false
```

Nao coloque senha real em documentacao, terminal compartilhado ou repositorio.

## Bootstrap admin

`npm run prisma:bootstrap-admin` executa `backend/prisma/bootstrap-admin.ts`.

Ele faz apenas:

- valida `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME` e `BOOTSTRAP_ADMIN_PASSWORD`;
- exige senha forte;
- rejeita senhas demo conhecidas;
- cria ou atualiza o `User` admin;
- cria ou atualiza o `AdminUser` com role `ADMIN`;
- nao cria clientes, projetos, arquivos, blog, newsletter, financeiro, inbox ou notificacoes demo;
- nao apaga dados;
- nao troca senha de admin existente sem `BOOTSTRAP_ADMIN_RESET_PASSWORD=true`.

Senha forte minima:

- 12+ caracteres;
- letra maiuscula;
- letra minuscula;
- numero;
- simbolo.

## Seed demo local/staging demo

`backend/prisma/seed.dev.ts` contem dados ficticios para desenvolvimento.

Ele e bloqueado se:

- `NODE_ENV=production`;
- `ALLOW_DEMO_SEED` for diferente de `true`.

Para rodar localmente em PowerShell:

```powershell
$env:ALLOW_DEMO_SEED='true'
npm run prisma:seed:dev
```

Para rodar localmente em bash:

```bash
ALLOW_DEMO_SEED=true npm run prisma:seed:dev
```

Use esse seed somente em banco local ou staging descartavel de demonstracao.

## Verificar banco limpo

Execute:

```bash
cd backend
npm run production:check-clean
```

O script consulta indicadores demo conhecidos e falha se encontrar:

- contas de clientes demo;
- empresas Marima, Bananinha Acai ou Ateliux Demo;
- projetos demo;
- URLs `res.cloudinary.com/demo`;
- URLs `preview.ateliux.dev`;
- blog/newsletter/financeiro/notificacoes/audit logs demo;
- usuarios com senhas demo conhecidas.

O script nao remove dados. Se falhar em staging/producao, parar o deploy e investigar o banco antes de prosseguir.

## Primeiro cliente real

Fluxo esperado depois do bootstrap:

1. Admin principal acessa a dashboard.
2. Admin cria o cliente real em `/clientes`.
3. Admin cria ou convida a conta do cliente.
4. Admin cria o projeto real no Portal do Cliente.
5. Admin cria briefing, etapa ou preview real.
6. Cliente acessa o Portal do Cliente.
7. Cliente envia arquivo real.
8. Admin revisa e aprova/rejeita arquivo.
9. Cliente acompanha projeto, arquivos, solicitacoes, suporte e financeiro com dados reais.

Se algum passo depender de seed demo, tratar como bloqueio antes de producao.

## Primeiro post real

1. Acessar `/blog` na admin.
2. Criar artigo com conteudo aprovado.
3. Publicar.
4. Validar listagem publica em `/blog`.
5. Validar leitura do slug publico.

Nao use artigo demo em producao.

## Empty states esperados

Com banco limpo e apenas admin principal:

- admin clientes: lista vazia com empty state;
- Portal do Cliente admin: sem clientes/projetos ate criacao real;
- admin blog: sem artigos;
- admin newsletter: sem assinantes;
- inbox: sem conversas;
- revisao de arquivos: sem arquivos pendentes;
- blog publico: empty state sem posts publicados;
- Portal do Cliente: sem acesso de cliente ate uma conta real existir.

## Dados proibidos em producao

Producao nao deve conter:

- clientes ficticios;
- projetos ficticios;
- arquivos ficticios;
- URLs fake;
- posts demo;
- assinantes newsletter fake;
- financeiro demo;
- notificacoes demo;
- usuarios com senha padrao demo.
