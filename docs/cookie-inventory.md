# Cookie Inventory

Inventario tecnico de cookies e armazenamentos usados pela Ateliux. Este documento nao substitui revisao juridica.

## Cookies necessarios

| Nome | Escopo | HttpOnly | Finalidade | Expiracao |
| --- | --- | --- | --- | --- |
| `ateliux_client_access_token` | frontend/Portal | sim | access token curto do cliente | `JWT_ACCESS_EXPIRES_IN` |
| `ateliux_client_refresh_token` | frontend/Portal | sim | refresh token do cliente | `JWT_REFRESH_EXPIRES_IN` |
| `ateliux_admin_access_token` | admin | sim | access token curto da admin | `JWT_ACCESS_EXPIRES_IN` |
| `ateliux_admin_refresh_token` | admin | sim | refresh token da admin | `JWT_REFRESH_EXPIRES_IN` |
| `ateliux_access_token` | legado | sim | compatibilidade temporaria | legado |
| `ateliux_refresh_token` | legado | sim | compatibilidade temporaria | legado |
| `ateliux_cookie_anonymous_id` | publico/portal | nao | identificar consentimento anonimo | 180 dias |
| `ateliux_cookie_consent` | publico/portal | nao | guardar resumo local do consentimento | 180 dias |

## LocalStorage

| Chave | Finalidade | Observacao |
| --- | --- | --- |
| `ateliux_cookie_anonymous_id` | manter identificador anonimo entre visitas | nao contem dado sensivel direto |
| `ateliux_cookie_consent` | manter preferencias de cookies | nao contem token de autenticacao |

## Categorias de consentimento

- Necessarios: sempre ativos; seguranca, sessao e funcionamento.
- Preferencias: escolhas de experiencia.
- Analiticos: medicao agregada quando houver ferramenta configurada.
- Marketing: mensuracao de campanhas quando houver ferramenta configurada.

Scripts de analytics/marketing devem usar os helpers `runWhenAnalyticsAllowed` e `runWhenMarketingAllowed` antes de carregar qualquer script nao essencial.

## Regras de staging/producao

- Nao usar `CORS_ORIGINS=*` com cookies.
- `COOKIE_SECURE=true`.
- `COOKIE_SAME_SITE=none` somente quando necessario para cross-site e sempre com `Secure`.
- Atualizar este inventario antes de adicionar qualquer ferramenta de terceiros.
