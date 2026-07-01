# Ateliux Demo Cleanup Report

- Date: 2026-06-30T20:58:02.527Z
- Mode: dry-run
- Environment: development
- Database host: lo***st
- Database name: at***ux
- Result: dry-run
- Total planned markers: 108
- Total removed rows: 0

## Tables

| Table | Planned markers | Removed rows | Notes |
| --- | ---: | ---: | --- |
| AuditLog | 28 | 0 |  |
| Notification | 6 | 0 |  |
| BlogShare | 1 | 0 | por post demo |
| SavedBlogPost | 1 | 0 | por post demo |
| BlogComment | 1 | 0 | por post demo |
| BlogPost | 1 | 0 |  |
| NewsletterSubscriber | 1 | 0 |  |
| ClientRequestAttachment | 7 | 0 |  |
| SupportTicketAttachment | 6 | 0 |  |
| InboxMessage | 9 | 0 |  |
| ClientRequest | 3 | 0 |  |
| SupportTicket | 2 | 0 |  |
| InboxConversation | 5 | 0 |  |
| Approval | 7 | 0 |  |
| Preview | 1 | 0 |  |
| BriefingResponse | 4 | 0 |  |
| Briefing | 1 | 0 |  |
| ScheduleEvent | 1 | 0 |  |
| FinanceRecord | 1 | 0 |  |
| ProjectStage | 6 | 0 |  |
| ProjectTeamMember | 3 | 0 |  |
| FileAsset | 4 | 0 | somente banco; Cloudinary fisico bloqueado |
| Project | 3 | 0 |  |
| Client | 3 | 0 |  |
| User CLIENT | 3 | 0 |  |
| User ADMIN seed | 0 | 0 | exige ALLOW_DEMO_ADMIN_CLEANUP=true |

## Ignored

- 3 admin user(s) seed conhecidos ignorados; defina ALLOW_DEMO_ADMIN_CLEANUP=true para incluir, preservando BOOTSTRAP_ADMIN_EMAIL.
- 1 bootstrap admin protegido por BOOTSTRAP_ADMIN_EMAIL.
- Dados E2E nao sao removidos por production:clean-demo-data.
- Assets fisicos do Cloudinary nao sao removidos por padrao.

## Blocked Reason

- None.

## Next Action

- Dry-run nao alterou o banco. Para aplicar em ambiente controlado, defina CONFIRM_CLEAN_DEMO_DATA=true, ALLOW_DEMO_CLEANUP=true, ALLOW_DEMO_CLEANUP_ENV=local|staging e CLEAN_DEMO_DATA_MODE=apply.

## Safety Notes

- production:clean-demo-data nao apaga Cloudinary fisico.
- Dados E2E nao sao removidos por este script.
- BOOTSTRAP_ADMIN_EMAIL e protegido quando definido.
- Nenhum valor completo de DATABASE_URL ou secret e gravado neste relatorio.
