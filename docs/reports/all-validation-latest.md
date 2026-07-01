# Ateliux all Validation Report

- Date: 2026-06-30T23:26:36.789Z
- Mode: all
- Branch: main
- Commit: a66fd3f
- Result: passed

## Steps

| Step | Status | Duration |
| --- | --- | --- |
| Backend prisma generate | passed | 5.0s |
| Backend migrate status | passed | 4.5s |
| Backend typecheck | passed | 10.3s |
| Backend lint | passed | 14.6s |
| Backend build | passed | 15.5s |
| Backend tests | passed | 7.5s |
| Backend audit | passed | 1.9s |
| Admin typecheck | passed | 3.9s |
| Admin lint | passed | 24.2s |
| Admin build | passed | 22.4s |
| Admin audit | passed | 1.9s |
| Frontend typecheck | passed | 5.6s |
| Frontend lint | passed | 19.7s |
| Frontend build | passed | 30.3s |
| Frontend audit | passed | 2.0s |
| Root audit | passed | 1.8s |
| Playwright E2E | passed | 59.4s |

## Warnings

- None recorded by the orchestrator.

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
