# Ateliux pre-staging Validation Report

- Date: 2026-06-30T20:07:59.634Z
- Mode: pre-staging
- Branch: main
- Commit: a66fd3f
- Result: passed

## Steps

| Step | Status | Duration |
| --- | --- | --- |
| Backend prisma generate | passed | 4.1s |
| Backend migrate status | passed | 4.2s |
| Backend typecheck | passed | 9.9s |
| Backend lint | passed | 12.8s |
| Backend build | passed | 14.2s |
| Backend tests | passed | 6.8s |
| Backend audit | passed | 1.9s |
| Admin typecheck | passed | 3.4s |
| Admin lint | passed | 13.5s |
| Admin build | passed | 19.3s |
| Admin audit | passed | 1.9s |
| Frontend typecheck | passed | 4.6s |
| Frontend lint | passed | 16.6s |
| Frontend build | passed | 28.9s |
| Frontend audit | passed | 2.0s |
| Root audit | passed | 1.8s |
| Playwright E2E | passed | 52.6s |

## Warnings

- staging env safety is running in rehearsal mode because NODE_ENV is not staging/production and VALIDATION_STRICT_ENV is not true.

## Known Warnings

- Prisma warns that package.json#prisma will be removed in Prisma 7.
- Admin and frontend may still report Next.js no-img-element warnings where dynamic images use <img>.

## Pending

- Expand browser E2E coverage to blog, uploads, inbox, finance and notifications.
- Run strict environment validation in the real staging/production provider with VALIDATION_STRICT_ENV=true.

## Security Notes

- This report intentionally does not include environment values or secrets.
- E2E production targets require explicit E2E_ALLOW_PRODUCTION=true.
