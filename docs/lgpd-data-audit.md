# LGPD Data Audit

Base tecnica para mapear dados pessoais tratados pelo ecossistema Ateliux. Este documento nao substitui revisao juridica.

## Escopo

- `backend`: API, auth, banco, uploads, auditoria, notificacoes, filas, e-mail e storage.
- `frontend`: site publico, blog, formularios e Portal do Cliente.
- `admin`: dashboard interna, clientes, projetos, inbox, suporte, blog, newsletter, arquivos e LGPD.

## Inventario de dados

| Origem | Dados | Finalidade | Base tecnica | Retencao sugerida |
| --- | --- | --- | --- | --- |
| Login cliente/admin | e-mail, senha hash, cookies httpOnly, refresh token hash, IP, User-Agent | autenticacao, seguranca e sessao | auth e auditoria | enquanto conta ativa e periodo de seguranca |
| Cadastro cliente | nome, e-mail, empresa, telefone, aceite legal, marketing opt-in | criar conta, liberar portal e registrar aceite | contrato/consentimento | enquanto conta ativa e obrigacoes aplicaveis |
| Contato comercial | nome, e-mail, telefone, empresa, projeto, prazo, orcamento, mensagem, anexo | atendimento comercial e proposta | atendimento/pre-contrato | ciclo comercial e defesa de direitos |
| Newsletter | e-mail, nome opcional, origem, interesses, status | envio de comunicacoes | consentimento | ate descadastro ou limpeza periodica |
| Suporte publico/cliente | nome, e-mail, empresa, categoria, prioridade, assunto, mensagem, anexos | atendimento e historico | execucao de servico | enquanto necessario para suporte e auditoria |
| Portal do Cliente | projetos, etapas, briefings, aprovacoes, solicitacoes, financeiro, cronograma, arquivos | execucao do contrato | contrato | ciclo do projeto e obrigacoes aplicaveis |
| Blog | comentarios, artigos salvos, compartilhamentos, conversa sobre artigo | interacao autenticada e suporte | consentimento/legitimo interesse tecnico | enquanto conta/artigo estiverem ativos |
| Cookies | anonymousId, preferencias, consentVersion, IP, User-Agent | registrar consentimento e bloquear scripts nao essenciais | consentimento/necessidade tecnica | ate expirar cookie ou nova versao |
| LGPD | nome, e-mail, tipo de pedido, mensagem, IP, User-Agent, status | atender direitos do titular | obrigacao legal | prazo necessario para resposta e prova |
| Admin | usuarios internos, roles, acoes, logs e auditoria | operacao, seguranca e permissao | contrato/seguranca | conforme politica interna |

## Pontos de controle implementados

- Cookies de auth continuam httpOnly e nao usam `localStorage`.
- `CookieConsent` registra consentimento anonimo ou autenticado.
- `PrivacyRequest` registra solicitacoes de titulares.
- Cadastro de cliente exige aceite de Termos de Uso e Politica de Privacidade.
- Newsletter exige aceite explicito antes de inscricao.
- Formularios exibem aviso de privacidade.
- Upload do Portal alerta para nao enviar dados sensiveis desnecessarios.
- Admin possui modulo LGPD para consultar consentimentos e tratar solicitacoes.

## Pendencias juridicas

- Validar textos legais com advogado.
- Definir encarregado/DPO e canal oficial.
- Definir prazos formais de resposta e retencao.
- Validar bases legais por finalidade.
- Validar contratos com operadores: banco, Cloudinary/storage, SMTP, Redis/infra, analytics e hospedagem.
- Definir politica de descarte e anonimizacao.
