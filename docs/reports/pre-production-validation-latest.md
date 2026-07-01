# Ateliux pre-production Validation Report

- Date: 2026-06-30T22:14:09.694Z
- Mode: pre-production
- Branch: main
- Commit: a66fd3f
- Result: failed

## Steps

| Step | Status | Duration |
| --- | --- | --- |
| Backend prisma generate | passed | 5.5s |
| Backend migrate status | passed | 5.2s |
| Backend typecheck | passed | 12.3s |
| Backend lint | passed | 16.6s |
| Backend build | passed | 17.6s |
| Backend tests | passed | 10.0s |
| Backend audit | passed | 2.5s |
| Admin typecheck | passed | 4.3s |
| Admin lint | passed | 16.2s |
| Admin build | passed | 23.2s |
| Admin audit | passed | 2.1s |
| Frontend typecheck | passed | 5.8s |
| Frontend lint | passed | 21.4s |
| Frontend build | passed | 36.6s |
| Frontend audit | passed | 2.6s |
| Root audit | passed | 2.8s |
| Playwright E2E | passed | 65.3s |
| Production clean check | failed | 18.0s |

## Warnings

- production env safety is running in rehearsal mode because NODE_ENV is not staging/production and VALIDATION_STRICT_ENV is not true.
- Production clean check blocked the validation. Use a new clean database or run db:clean-demo:dry-run before any explicitly confirmed cleanup.

## Known Warnings

- Prisma warns that package.json#prisma will be removed in Prisma 7.
- Admin and frontend may still report Next.js no-img-element warnings where dynamic images use <img>.
- Next.js may warn about multiple lockfiles because the repository has root, admin and frontend package-lock files.

## Pending

- Expand browser E2E coverage to blog, uploads, inbox, finance and notifications.
- Run strict environment validation in the real staging/production provider with VALIDATION_STRICT_ENV=true.

## Security Notes

- This report intentionally does not include environment values or secrets.
- E2E production targets require explicit E2E_ALLOW_PRODUCTION=true.
