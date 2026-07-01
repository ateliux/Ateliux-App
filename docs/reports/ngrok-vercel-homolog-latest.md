# Ateliux Ngrok/Vercel Homologation Report

- Date: 2026-06-30
- Environment: Docker local homologation + ngrok Docker profile
- Decision: partially approved

## Scope

Validated path:

```txt
ngrok HTTPS tunnel
-> localhost:3054
-> Docker backend:3001
-> PostgreSQL Docker
-> Redis Docker
```

The Vercel dashboard/redeploy step was not executed because this workspace does not have:

- Vercel CLI available in `PATH`;
- `VERCEL_TOKEN` in the shell environment;
- `.vercel/project.json` linked to a Vercel project;
- real frontend Vercel domain configured in repository env files.

## URLs

- Local API: `http://localhost:3054/api`
- Local health: `http://localhost:3054/api/health`
- Ngrok API: `https://aubrie***rok-free.dev/api`
- Ngrok health: `https://aubrie***rok-free.dev/api/health`
- Frontend Vercel tested: not available in this workspace
- Expected Vercel env: `NEXT_PUBLIC_API_BASE_URL=https://<ngrok-host>/api`

## Docker

Result:

- Docker backend: healthy
- PostgreSQL: healthy
- Redis: healthy
- Local health: passed
- Migrations: up to date with `prisma migrate deploy`
- Bootstrap admin: executed; existing admin preserved
- Production clean check on Docker DB: passed

## Ngrok

Method used:

```txt
Docker compose profile: ngrok
```

The token was read from local ngrok configuration and placed only in local `.env.docker`.
The token was not printed or versioned.

Ngrok health result:

```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok",
  "environment": "test"
}
```

## CORS

Validated against configured origin:

```txt
https://seu-frontend.vercel.app
```

Result:

- Preflight status: `204`
- `Access-Control-Allow-Origin`: configured Vercel placeholder origin
- `Access-Control-Allow-Credentials`: `true`
- Allowed methods: `GET,HEAD,PUT,PATCH,POST,DELETE`
- Allowed headers: `content-type,x-ateliux-auth-scope`

The real Vercel origin was not validated because it is not available in this workspace.

## Cookies

Validated through ngrok with real API responses.

Client register/login cookies:

- `Set-Cookie`: present
- `HttpOnly`: present
- `Secure`: present
- `SameSite=None`: present
- `Domain=localhost`: absent

Admin login cookies:

- `Set-Cookie`: present
- `HttpOnly`: present
- `Secure`: present
- `SameSite=None`: present
- `Domain=localhost`: absent

Browser acceptance in Vercel was not validated because Vercel redeploy was not available.

## Auth And Portal

Validated through ngrok:

- Client register: `201`
- Client login: `201`
- `GET /auth/client/me`: `200`
- repeated `GET /auth/client/me`: `200`
- Admin login: `201`
- `POST /admin/projects/full-setup`: project visible created
- `POST /admin/projects/full-setup`: project invisible created
- `GET /client/projects`: `200`
- visible project appears in Portal response
- invisible project does not appear in Portal response

## Logs And Secrets

Backend logs were scanned for obvious secret markers:

- JWT
- refresh token
- `NGROK_AUTHTOKEN`
- `SMTP_PASS`
- `CLOUDINARY_API_SECRET`
- `DATABASE_URL`
- `COOKIE_SECRET`
- password
- `Set-Cookie`

No matching secret output was found in the reviewed backend log tail.

## Commands Executed

```bash
npm run docker:homolog:config
npm run docker:homolog:up
npm run docker:homolog:health
npm run docker:homolog:ps
npm run docker:homolog:migrate
npm run docker:homolog:migrate:status
npm run docker:homolog:bootstrap-admin
npm run docker:homolog:check-clean
docker compose --env-file .env.docker -f docker-compose.local-homolog.yml --profile ngrok up -d ngrok
npm run docker:homolog:ngrok:url
```

Additional HTTP checks were executed against ngrok for health, CORS, cookies, auth and Portal data.

## Warnings

- The backend stayed with `NODE_ENV=test` for local homologation because the backend correctly blocks staging/production envs that include localhost origins.
- The configured CORS origin is still a placeholder: `https://seu-frontend.vercel.app`.
- Real Vercel env update and redeploy were not possible from this workspace.
- `ngrok` CLI is not installed locally; Docker profile was used instead.
- `vercel` CLI is not installed locally.
- There is no linked `.vercel/project.json`.
- Free ngrok URLs can change; Vercel must be redeployed whenever `NEXT_PUBLIC_API_BASE_URL` changes.

## Pending

- Replace `CLIENT_APP_URL` and `CORS_ORIGINS` in `.env.docker` with the real frontend Vercel domain.
- Configure Vercel:

```txt
NEXT_PUBLIC_API_BASE_URL=https://<ngrok-host>/api
```

- Redeploy frontend on Vercel.
- Open frontend Vercel in a browser and validate:
  - browser CORS against the real Vercel origin;
  - browser cookie storage;
  - F5 preserving session;
  - Portal pages consuming ngrok API.
- Optionally link Vercel CLI with `.vercel/project.json` for repeatable automated redeploy.

## Final Decision

The Docker -> ngrok -> backend path is approved.

The complete Vercel -> ngrok -> Docker local path is not fully approved yet because the real Vercel project/domain/redeploy was not available in this workspace.
