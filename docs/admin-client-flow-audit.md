# Admin -> Backend -> Portal do Cliente

Auditoria do fluxo de criacao e gestao de projetos Ateliux.

## Resumo

Antes desta revisao, `POST /admin/projects` criava apenas o registro basico do projeto. O `managerId` era opcional no banco e a tela admin nao preenchia responsavel, etapa inicial, briefing, cronograma, financeiro nem historico no mesmo fluxo. Como o Portal do Cliente consome a API real, projetos criados dessa forma podiam aparecer com responsavel/equipe vazios e poucos dados de acompanhamento.

Agora existe um fluxo centralizado:

```txt
Admin cria projeto completo
-> POST /admin/projects/full-setup
-> backend valida cliente, responsavel e equipe
-> cria projeto, etapa inicial, briefing opcional, cronograma opcional, financeiro opcional
-> registra historico e notificacao
-> Portal do Cliente le dados reais pelos endpoints /client/*
```

## Fluxos encontrados

| Fluxo | Local | Endpoint usado | Campos enviados | Cria responsavel? | Cria historico? | Afeta Portal? | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Criacao completa de projeto | `admin/components/admin/views/PortalManagementView.tsx` | `POST /admin/projects/full-setup` | cliente, nome, tipo, escopo, descricao, status, prioridade, responsavel, equipe, prazo, etapa, progresso, visibilidade, opcionais de briefing/cronograma/financeiro | sim | sim | sim | Principal |
| Criar projeto para cliente pela tela Clientes | `admin/components/admin/views/ClientsManagementView.tsx` -> `PortalManagementView` | `POST /admin/projects/full-setup` | `clientId` via query string e dados obrigatorios do full setup | sim | sim | sim se visivel | Principal |
| Service admin antigo | `admin/services/admin-projects.service.ts` | antes chamava `POST /admin/projects` | payload livre/incompleto | incerto | incerto | sim | Removido da admin |
| Endpoint legado de criacao simples | `backend/src/projects/projects.controller.ts` | `POST /admin/projects` | antes aceitava `CreateProjectDto` | sim, mas sem demais dados minimos | sim | sim | Legado bloqueado |
| Edicao de projeto | `PortalManagementView` e `PATCH /admin/projects/:id` | `PATCH /admin/projects/:id` | responsavel, equipe, status, prioridade, prazo, progresso, etapa, escopo, resumo, visibilidade | sim | sim para campos importantes | sim | Apenas edicao segura |
| Arquivar/concluir projeto | `PortalManagementView` | `PATCH /admin/projects/:id` | status/progresso | usa responsavel existente | sim quando campo relevante muda | sim | Apenas edicao |
| Leitura do Portal | `frontend/components/client-portal/*` | `GET /client/projects`, `GET /client/projects/:id`, `GET /client/team` | nenhum payload de criacao | le responsavel real | le historico real | sim | Apenas leitura |
| Seed demo local | `backend/prisma/seed.dev.ts` | Prisma direto | dados demo com `managerId` | sim | sim | somente local/demo | Interno controlado |

Fluxo oficial unico para criacao de projeto na admin:

```txt
POST /admin/projects/full-setup
```

Da tela de clientes, a acao oficial e `Criar projeto para este cliente`. Ela navega para:

```txt
/portal-do-cliente/projetos?clientId=<clientId>&create=1
```

O antigo modal "Vincular projeto" foi removido porque nao persistia relacao real. O cliente chega pre-selecionado/bloqueado no full setup e, apos o `POST /admin/projects/full-setup`, a admin navega para:

```txt
/portal-do-cliente/projetos/[projectId]
```

`POST /admin/projects` continua existindo apenas como endpoint legado de compatibilidade de rota, mas retorna erro controlado informando que foi substituido por `/admin/projects/full-setup`. Ele nao cria mais `Project`.

## Validacao do fluxo "Criar projeto para este cliente"

Rota usada pela tela de clientes:

```txt
/portal-do-cliente/projetos?clientId=<clientId>&create=1
```

Contrato funcional:

- `clientId` vem pela query string e inicializa o full setup.
- o select de cliente fica bloqueado quando `clientId` esta presente.
- o submit chama somente `POST /admin/projects/full-setup`.
- o backend retorna o `projectId` real e a admin redireciona para `/portal-do-cliente/projetos/[projectId]`.
- `visibleToClient=true` publica o projeto para `/client/projects` e cria notificacao ao cliente.
- `visibleToClient=false` salva o projeto apenas para admin, sem aparecer no Portal do Cliente.
- F5 na lista, na central do projeto e no Portal deve manter o estado porque tudo vem da API real.
- falha de backend nao deve mostrar toast de sucesso nem salvar estado falso.

Testes relacionados:

```txt
backend/src/projects/projects.service.spec.ts
e2e/admin-client-project-flow.spec.ts
```

Cobertura adicionada: `clientId` real, visibilidade no Portal, invisibilidade no Portal, ausencia de notificacao em projeto interno, isolamento entre clientes, bloqueio de dados minimos e endpoint legado bloqueado.

Harness browser versionado:

- framework: Playwright;
- local: `/e2e`;
- script: `npm run e2e`;
- rotina oficial: `npm run validate:e2e`, `npm run validate:all`, `npm run validate:pre-staging` e `npm run validate:pre-production`;
- cobre admin no navegador, criacao real via full setup, F5, Portal do Cliente, projeto visivel, projeto invisivel, erro sem dados minimos e ausencia do fluxo falso.

## Central operacional do projeto

A admin agora possui uma pagina dedicada por projeto:

```txt
Admin -> Portal do Cliente -> Projetos -> Abrir projeto
```

Rota:

```txt
/portal-do-cliente/projetos/[projectId]
```

Essa pagina usa `AdminShell`, carrega dados reais pelo service `admin/services/admin-project-workspace.service.ts` e renderiza `ProjectWorkspaceView`. A listagem de projetos em `PortalManagementView` recebeu o botao `Abrir projeto`, mantendo as acoes existentes de editar, concluir e arquivar.

Endpoint agregador:

```txt
GET /admin/projects/:id/overview
```

O endpoint fica antes de `GET /admin/projects/:id` no controller para evitar conflito de rota. Ele usa `AdminAuthGuard`, `RolesGuard` e aceita somente:

```txt
ADMIN
PROJECT_MANAGER
DESIGNER_DEV
SUPPORT
FINANCE
```

`EDITOR` e `ATTENDANCE` nao acessam o overview. Falta de permissao retorna `403` pelo guard, sem tratar como logout.

Retorno operacional:

- `project`, com dados principais e `manager`;
- `client`, com conta, responsavel e demais projetos do cliente;
- `team`;
- `stages`;
- `briefings`;
- `files`;
- `approvals`;
- `previews`;
- `schedule`;
- `finance`;
- `history`;
- `requests`;
- `inbox`;
- `stats`;
- `permissions`.

Dados financeiros sao retornados apenas para `ADMIN`, `PROJECT_MANAGER` e `FINANCE`. Para `SUPPORT` e `DESIGNER_DEV`, `finance` volta vazio e `stats.pendingPayments` fica `0`.

Abas implementadas:

- Visao geral: indicadores, solicitacoes e inbox do projeto.
- Cliente: dados do cliente, conta e projetos vinculados.
- Equipe: responsavel principal, equipe interna e edicao de equipe para roles autorizadas.
- Escopo: tipo, escopo, descricao, resumo do cliente e notas internas.
- Etapas: listagem, empty state e criacao/publicacao quando permitido.
- Briefing: listagem, empty state, criacao e envio quando permitido.
- Arquivos: listagem, status, risco/download mode, upload, aprovacao e rejeicao quando permitido.
- Aprovacoes: listagem, criacao e envio.
- Preview: listagem, link externo, criacao e envio para aprovacao.
- Cronograma: listagem e criacao de evento.
- Financeiro: listagem/criacao somente com permissao financeira.
- Historico: eventos reais de `AuditLog` e nota manual.
- Configuracoes do Portal: visibilidade, progresso, etapa atual, prazo e resumo para cliente.

As acoes reutilizam endpoints existentes de projetos, modulos do portal, arquivos e historico. A tela nao usa mock como fonte de verdade.

## Mapa de consistencia

| Informacao | Aparece no Portal? | Existe no Backend? | Admin cria/edita? | Obrigatorio? | Problema anterior | Correcao |
| --- | --- | --- | --- | --- | --- | --- |
| Cliente | sim | `Client` | sim | sim | projeto podia ser criado isolado com poucos dados | validacao de `clientId` no setup |
| Empresa | sim | `Client.company` | sim | sim no cliente | ok | exibido a partir do cliente real |
| Plano | sim | `Client.plan` | sim | sim no cliente | adapter buscava `project.plan` inexistente | Portal agora usa `client.plan` quando vier aninhado |
| Projeto | sim | `Project` | sim | sim | criacao basica demais | fluxo completo em `/admin/projects/full-setup` |
| Tipo do projeto | sim | `Project.type` | sim | sim | campo fixo no admin | campo editavel no setup |
| Escopo | sim | `Project.scope` | sim | sim | virava descricao generica | campo obrigatorio no setup |
| Descricao | sim, como resumo | `Project.description` | sim | sim | nao existia | obrigatoria no setup completo |
| Status | sim | `Project.status` | sim | sim | admin preenchia default sem contexto | campo no setup |
| Prioridade | nao destacado ainda | `Project.priority` | sim | sim | nao existia | obrigatoria no setup completo |
| Progresso | sim | `Project.progress` | sim | sim | sempre 0 | obrigatorio entre 0 e 100 |
| Etapa atual | sim | `Project.currentStage` | sim | sim | podia ficar vazio | obrigatoria no setup completo |
| Responsavel principal | sim via equipe | `Project.managerId` | sim | sim no setup | admin nao preenchia; Portal ficava sem responsavel | `managerId` obrigatorio no DTO de criacao |
| Equipe interna | sim | `ProjectTeamMember` | sim | opcional | nao havia vinculo por projeto | tabela `ProjectTeamMember` |
| Prazo final | sim | `Project.deadline` | sim | sim | frequentemente vazio | obrigatorio no setup completo |
| Data de inicio | nao destacado ainda | `Project.startDate` | sim | opcional | nao existia | migration opcional segura |
| Resumo para cliente | sim | `Project.clientFacingSummary` | sim | recomendado | nao existia | usado no Portal, com fallback para escopo/descricao |
| Observacoes internas | nao | `Project.internalNotes` | sim | opcional | nao existia | campo interno no setup |
| Briefing inicial | sim em `/cliente/briefings` | `Briefing` | sim | opcional | precisava criar separado | opcional no full setup |
| Etapas do projeto | sim | `ProjectStage` | sim | etapa inicial obrigatoria no setup | precisava criar separado | etapa inicial criada em transacao |
| Aprovacoes | sim | `Approval` | sim em modulo proprio | opcional posterior | nao precisa nascer junto | mantido como modulo proprio |
| Preview | sim | `Preview` | sim em modulo proprio | opcional posterior | nao precisa nascer junto | mantido como modulo proprio |
| Arquivos | sim | `FileAsset` | sim em modulo proprio | opcional posterior | fluxo ja seguro | mantido em uploads/arquivos |
| Cronograma | sim | `ScheduleEvent` | sim | opcional | precisava criar separado | opcional no full setup |
| Financeiro | sim | `FinanceRecord` | sim | opcional | precisava criar separado | opcional no full setup |
| Historico | sim | `AuditLog` | automatico/manual | automatico | projeto nascia sem linha do tempo | `PROJECT_CREATED_FULL_SETUP` automatico |
| Solicitacoes | sim | `ClientRequest` | sim em modulo proprio | posterior | ok | mantido |
| Suporte | sim | `SupportTicket`/Inbox | sim em modulo proprio | posterior | ok | mantido |
| Visibilidade do Portal | sim | `Project.visibleToClient` | sim | sim | projeto podia aparecer incompleto | setup controla publicacao/notificacao |

## Modelo ideal adotado

A tela admin usa seções, nao um formulario gigante:

1. Cliente e contrato.
2. Dados principais do projeto.
3. Responsaveis e equipe.
4. Portal do Cliente.
5. Etapa inicial.
6. Briefing inicial.
7. Cronograma opcional.
8. Financeiro opcional.
9. Revisao.

Campos obrigatorios no setup:

```txt
clientId
name
type
scope
description
status
priority
managerId
deadline
visibleToClient
currentStage
progress
```

Campos recomendados:

```txt
clientFacingSummary
startDate
```

Campos opcionais no mesmo fluxo:

```txt
teamIds
initialBriefing
initialScheduleEvents
initialFinance
internalNotes
```

## Endpoints

Novo:

```txt
GET  /admin/users
GET  /admin/projects/:id/overview
POST /admin/projects/full-setup
```

Ajustado:

```txt
POST  /admin/projects           -> legado bloqueado, nao cria projeto
PATCH /admin/projects/:id
GET   /client/projects
GET   /client/projects/:id
GET   /client/team
```

`POST /admin/projects/full-setup` cria em transacao:

- `Project`;
- `ProjectTeamMember`, se houver equipe;
- `ProjectStage` inicial;
- `Briefing`, se informado;
- `ScheduleEvent`, se informado;
- `FinanceRecord`, se informado;
- `AuditLog`;
- `Notification`, se visivel para cliente e a conta existir.

`PATCH /admin/projects/:id` permite editar responsavel principal, equipe, status, prioridade, prazo, progresso, etapa atual, resumo, visibilidade, escopo e descricao. Se a edicao tentar deixar o projeto visivel no Portal sem responsavel, etapa atual, progresso valido, prazo valido ou escopo/resumo, o backend bloqueia a atualizacao.

## Permissoes

- `ADMIN` e `PROJECT_MANAGER`: criam e editam projetos.
- `DESIGNER_DEV`: continua atuando em etapas, previews, briefing e arquivos pelos modulos existentes.
- `FINANCE`: continua atuando em financeiro pelos endpoints de financeiro.
- `SUPPORT`: visualiza e responde suporte/solicitacoes, sem alterar projeto/financeiro.
- `EDITOR` e `ATTENDANCE`: nao criam projetos pelo backend.
- Overview do projeto: `ADMIN`, `PROJECT_MANAGER`, `DESIGNER_DEV`, `SUPPORT` e `FINANCE`.
- Financeiro no overview: visivel apenas para `ADMIN`, `PROJECT_MANAGER` e `FINANCE`.

## Teste anti-projeto-incompleto

Cobertura adicionada em `backend/src/projects/projects.service.spec.ts`:

- full setup cria projeto completo com responsavel, etapa, briefing, cronograma, financeiro, historico e notificacao;
- endpoint legado `POST /admin/projects` retorna erro de substituicao;
- criacao visivel incompleta pelo service legado e bloqueada;
- projeto listado ao cliente traz responsavel;
- edicao de responsavel/progresso atualiza historico, responsavel do cliente e retorno do cliente;
- ocultar projeto remove o item dos endpoints do cliente.
- `GET /admin/projects/:id/overview` retorna projeto completo, cliente, responsavel, equipe, etapas, arquivos, historico e stats;
- projeto inexistente no overview retorna `404`;
- roles permitidas acessam o overview e roles sem permissao sao bloqueadas pelo `RolesGuard`;
- role sem permissao financeira nao recebe dados financeiros sensiveis;
- dados do overview batem com os dados usados pelo Portal do Cliente.

## Gaps ainda existentes

- O setup cria uma etapa inicial e opcionais principais; aprovacoes, previews e arquivos seguem como modulos separados por serem itens operacionais posteriores.
- Campos de paginas, tecnologias, links e publico-alvo ainda nao possuem modelo dedicado. Hoje o Portal usa escopo/resumo/briefing como fonte.
- A central operacional ja existe, mas pode evoluir com editores avancados por aba, filtros internos, timeline mais rica e drawer de mensagens por conversa.
