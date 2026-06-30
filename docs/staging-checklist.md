# Ateliux Staging Checklist

Checklist para subir o ecossistema Ateliux em staging.

## Ambiente

- [ ] Backend env configurado
- [ ] Frontend env configurado
- [ ] Admin env configurado
- [ ] `NODE_ENV=staging`
- [ ] `COOKIE_SECURE=true`
- [ ] `COOKIE_DOMAIN` correto para staging e nunca `localhost`
- [ ] `COOKIE_SAME_SITE` definido conforme dominios
- [ ] `JWT_ACCESS_EXPIRES_IN` definido
- [ ] `JWT_REFRESH_EXPIRES_IN` definido
- [ ] `NEXT_PUBLIC_ENABLE_DEV_FALLBACK=false`
- [ ] Secrets fortes configurados no provedor
- [ ] Nenhum `.env` real versionado

## Infra

- [ ] Banco staging criado
- [ ] Redis staging criado
- [ ] Migrations aplicadas com `npx prisma migrate deploy`
- [ ] Seed revisado antes de uso em staging/demo
- [ ] Cloudinary staging testado
- [ ] SMTP staging testado
- [ ] Health check ok
- [ ] Logs ok

## Seguranca

- [ ] CORS validado e restrito
- [ ] Cookies validados no browser real
- [ ] Cookies admin e cliente separados por escopo
- [ ] F5 apos login mantem sessao
- [ ] `401` executa refresh e retry unico
- [ ] Reuso de refresh token antigo retorna `401`
- [ ] `403` mostra falta de permissao sem logout
- [ ] Logout limpa cookies admin, cliente e legado
- [ ] Fallback bloqueado em producao/staging
- [ ] Rate limit ativo
- [ ] Upload security validado
- [ ] Banner de cookies validado
- [ ] Cookies nao essenciais bloqueados sem consentimento
- [ ] `CookieConsent` gravado no backend
- [ ] Formulario LGPD cria `PrivacyRequest`
- [ ] Admin LGPD lista consentimentos e solicitacoes
- [ ] Textos legais revisados juridicamente antes de uso publico definitivo
- [ ] Secrets nao aparecem no bundle frontend/admin
- [ ] `npm audit` revisado

## Fluxos

- [ ] Upload testado
- [ ] Auth cliente testada
- [ ] Auth admin testada
- [ ] Admin revisa arquivo
- [ ] Cliente baixa arquivo aprovado
- [ ] Admin exclui arquivo e o asset some fisicamente do Cloudinary
- [ ] Cliente nao baixa arquivo `DELETED`
- [ ] Troca/remocao de imagem do blog limpa asset antigo somente quando orfao
- [ ] Inbox/suporte testados
- [ ] Admin cria projeto completo via `/admin/projects/full-setup`
- [ ] Endpoint legado `POST /admin/projects` nao cria projeto e retorna erro controlado
- [ ] Admin abre projeto pela acao `Abrir projeto`
- [ ] `/portal-do-cliente/projetos/[projectId]` carrega dados reais via `GET /admin/projects/:id/overview`
- [ ] Central operacional mostra cliente, responsavel, equipe, etapas, arquivos, historico e empty states
- [ ] Role sem permissao recebe `403` no overview sem perder sessao
- [ ] Role sem permissao financeira nao ve valores financeiros no overview
- [ ] Projeto criado aparece no Portal do Cliente com responsavel principal
- [ ] Equipe interna aparece em `/cliente/equipe`
- [ ] Etapa inicial aparece em `/cliente/etapas`
- [ ] Briefing inicial, cronograma e financeiro opcionais aparecem quando informados
- [ ] Historico registra criacao completa do projeto
- [ ] Cliente recebe notificacao quando projeto visivel e criado
- [ ] Admin edita responsavel/progresso/prazo/etapa e cliente ve a alteracao no Portal
- [ ] Admin edita progresso/status/etapa/visibilidade pela central operacional e cliente ve a alteracao no Portal
- [ ] Admin oculta projeto e cliente deixa de ve-lo no Portal
- [ ] Blog testado
- [ ] Blog admin cria tag e publica artigo com tag principal
- [ ] Blog admin envia capa e hero via Cloudinary
- [ ] Blog publico lista artigo sem fallback mockado
- [ ] Cliente comenta artigo e admin modera comentario
- [ ] Cliente salva artigo e visualiza em `/cliente/artigos-salvos`
- [ ] Botao lateral do artigo cria conversa no Portal do Cliente
- [ ] Newsletter testada
- [ ] Financeiro testado
- [ ] Notificacoes testadas
- [ ] Builds ok
