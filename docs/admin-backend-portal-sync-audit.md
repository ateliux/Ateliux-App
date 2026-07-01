# Admin Backend Portal Sync Audit

Auditoria da sincronizacao entre a dashboard admin, backend e Portal do Cliente.

## Decisao aplicada

`Client.status` continua sendo status de conta/acesso:

```txt
ACTIVE
INVITED
SUSPENDED
ARCHIVED
```

O status comercial exibido no kanban/lista de clientes da admin agora possui campo proprio:

```txt
Client.pipelineStatus
```

Valores persistidos:

```txt
NEW
BRIEFING
DESIGN
DEVELOPMENT
APPROVAL
COMPLETED
INACTIVE
```

Esse campo e interno da admin. Ele nao deve ser usado para liberar/bloquear login e nao deve aparecer nas respostas do Portal do Cliente.

## Problema corrigido

Antes, `admin/components/admin/views/ClientsManagementView.tsx` alterava `AdminClient.status` apenas no estado React e mostrava:

```txt
Status de pipeline atualizado somente na UI; o backend armazena status de conta.
```

Isso criava divergencia: recarregar a admin ou consultar a API real perdia a alteracao.

Agora:

- `PATCH /admin/clients/:id/status` altera somente conta/acesso.
- `PATCH /admin/clients/:id/pipeline-status` altera somente pipeline comercial.
- `admin/services/admin-clients.service.ts` mapeia `pipelineStatus` da API para o kanban.
- `ClientsManagementView` chama o endpoint real ao alterar status comercial.
- A alteracao cria `AuditLog` com action `CLIENT_PIPELINE_STATUS_UPDATED`.

## Migracao

Migration adicionada:

```txt
20260630120000_client_pipeline_status
```

Ela cria o enum `ClientPipelineStatus`, adiciona `Client.pipelineStatus` com default `NEW` e indexa o campo.

Em staging/producao, aplicar com:

```bash
cd backend
npx prisma migrate deploy
```

Nao usar `prisma migrate dev` fora do ambiente local.

## Contratos admin

| Acao na Admin | Campo na UI | Endpoint chamado | Campo no Backend | Persistido? | Aparece no Portal? | Problema | Correcao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Criar cliente | dados principais | `POST /admin/clients` | `Client.name/company/email/phone/plan/status` | sim | somente como cliente relacionado a projeto/conta | ok | mantido |
| Editar cliente | dados principais | `PATCH /admin/clients/:id` | `Client.name/company/email/phone/plan` | sim | dados cadastrais aparecem quando o Portal usa o cliente | ok | mantido |
| Alterar status da conta | conta | `PATCH /admin/clients/:id/status` | `Client.status` | sim | parcialmente, como status de conta quando exposto | ok | mantido separado |
| Alterar status comercial | status comercial/kanban | `PATCH /admin/clients/:id/pipeline-status` | `Client.pipelineStatus` | sim | nao | antes era apenas `useState` | endpoint, migration e audit log criados |
| Inativar conta | conta | `PATCH /admin/clients/:id/status` | `Client.status=SUSPENDED` | sim | controla acesso/situacao da conta | antes tambem alterava pipeline local | agora nao mistura conta e pipeline |
| Criar projeto para este cliente | cliente pre-selecionado | `POST /admin/projects/full-setup` | `Project.clientId` | sim | sim, via `/client/projects` se `visibleToClient=true` | modal antigo simulava vinculo local | acao virou link para `/portal-do-cliente/projetos?clientId=<clientId>&create=1` e usa full setup real |
| Alterar status do projeto | status | `PATCH /admin/projects/:id` | `Project.status` | sim | sim se projeto visivel | ok | mantido |
| Alterar responsavel | responsavel | `PATCH /admin/projects/:id` | `Project.managerId` e `Client.responsibleId` | sim | sim em projeto/equipe | ok | mantido com historico |
| Alterar equipe | equipe | endpoints do workspace/projeto | `ProjectTeamMember` | sim | sim quando publico no Portal | ok | mantido |
| Alterar progresso | progresso | `PATCH /admin/projects/:id` | `Project.progress` | sim | sim | ok | mantido com historico |
| Alterar etapa atual | etapa atual | `PATCH /admin/projects/:id` | `Project.currentStage` | sim | sim | ok | mantido com historico |
| Alterar visibilidade | visibilidade | `PATCH /admin/projects/:id` | `Project.visibleToClient` | sim | sim, controla presenca no Portal | ok | mantido com historico |
| Alterar prazo | prazo | `PATCH /admin/projects/:id` | `Project.deadline` | sim | sim | ok | mantido com historico |
| Alterar plano | plano | `PATCH /admin/clients/:id` | `Client.plan` | sim | sim quando cliente e exibido | ok | mantido |
| Alterar financeiro | financeiro | endpoints financeiros/admin workspace | `FinanceRecord` | sim | sim quando `visibleToClient=true` | ok | mantido |
| Aprovar/rejeitar arquivo | revisao de arquivo | endpoints de arquivos/admin | `FileAsset.status` | sim | sim para arquivo aprovado; pendente/rejeitado bloqueado | ok | mantido com auditoria |
| Responder solicitacao | solicitacao | endpoints de requests/inbox | `ClientRequest.response`, `InboxMessage` | sim | sim | ok | mantido |
| Responder suporte | suporte | endpoints de support/inbox | `SupportTicket`, `InboxMessage` | sim | sim | ok | mantido |
| Criar notificacao | evento operacional | backend por fluxo | `Notification` | sim | sim quando audience `CLIENT` | ok | mantido |

## Contratos Portal do Cliente

O Portal continua consumindo projetos, equipe, financeiro, arquivos, aprovacoes e historico pelos endpoints `/client/*`.

O campo `pipelineStatus` foi mantido fora das respostas de:

- `POST /auth/client/login`;
- `POST /auth/client/refresh`;
- `GET /auth/client/me`;
- `GET /client/projects`;
- `GET /client/projects/:id`.

## Decisao sobre "Vincular projeto"

Nao foi criado fluxo para mover projeto existente entre clientes. Essa operacao e sensivel porque pode trocar arquivos, financeiro, historico e mensagens de cliente.

A acao oficial agora e:

```txt
Criar projeto para este cliente
```

Fluxo implementado:

```txt
Admin -> Clientes -> Criar projeto para este cliente
-> /portal-do-cliente/projetos?clientId=<clientId>&create=1
-> cliente fica pre-selecionado no full setup
-> POST /admin/projects/full-setup
-> backend cria Project com Project.clientId real
-> backend registra AuditLog e Notification quando visivel
-> admin redireciona para /portal-do-cliente/projetos/[projectId]
-> Portal do Cliente passa a listar o projeto em /client/projects se visibleToClient=true
```

Nao existe mais modal operacional chamado "Vincular projeto" na tela de clientes.

## Validacao automatizada

Testes adicionados/ajustados:

```txt
backend/src/clients/clients.service.spec.ts
backend/src/projects/projects.service.spec.ts
e2e/admin-client-project-flow.spec.ts
```

Cobertura:

- persiste `Client.pipelineStatus`;
- registra `AuditLog`;
- associa ator admin corretamente.
- bloqueia `POST /admin/projects` legado;
- `POST /admin/projects/full-setup` cria projeto com `clientId` real;
- projeto `visibleToClient=true` aparece em `/client/projects`;
- projeto `visibleToClient=false` nao aparece em `/client/projects`;
- projeto invisivel nao gera notificacao para cliente;
- outro cliente nao ve projeto que nao pertence a ele;
- projeto visivel sem responsavel ou dados minimos falha.
- browser E2E abre a admin, cria projeto real, valida F5, abre o Portal e valida projeto visivel/invisivel.

## Validacao do fluxo "Criar projeto para este cliente"

Fluxo validado/esperado:

```txt
Admin -> Clientes -> Criar projeto para este cliente
-> /portal-do-cliente/projetos?clientId=<clientId>&create=1
-> cliente fica pre-selecionado e bloqueado no full setup
-> POST /admin/projects/full-setup
-> sucesso redireciona para /portal-do-cliente/projetos/[projectId]
-> F5 mantem o vinculo porque os dados vem do backend
```

Regras:

- `visibleToClient=true`: projeto aparece no Portal do Cliente via `/client/projects`, com responsavel, etapa atual, progresso, prazo e resumo/escopo.
- `visibleToClient=false`: projeto permanece na admin, mas nao aparece no Portal e nao cria notificacao para cliente.
- erro de backend, como responsavel ausente ou prazo invalido, deve mostrar erro e nao registrar sucesso local.
- nao existe mais modal operacional de vinculo local na tela de clientes.
- teste versionado: `npm run e2e`.
- rotina oficial de release: `npm run validate:e2e`, `npm run validate:all`, `npm run validate:pre-staging` e `npm run validate:pre-production`.

## Riscos restantes

- `pipelineStatus` e interno; qualquer novo endpoint cliente que inclua `client: true` deve sanitizar a resposta antes de retornar ao browser do cliente.
- Vincular projeto existente a outro cliente segue nao implementado por decisao de seguranca operacional. Se virar requisito, deve ser um endpoint proprio com auditoria, validacao de dados sensiveis e confirmacao explicita.
