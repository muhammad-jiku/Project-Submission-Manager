# Quickstart

## Prerequisites

- Node.js 22+
- Docker Desktop (for local PostgreSQL)

## 1. Install

```bash
npm install
npm --prefix client install
npm --prefix server install
```

## 2. Start the database

```bash
docker compose up -d
```

Starts a local Postgres container on port `5434` (see `docker-compose.yml`).

## 3. Configure the backend's environment

```bash
cp server/.env.example server/.env
```

Fill in real values — see [ENVIRONMENT.md](./ENVIRONMENT.md) for what each one does. The default
`DATABASE_URL` in `.env.example` matches the local Docker container.

## 4. Run migrations and seed the admin

```bash
npm --prefix server run prisma:migrate
npm --prefix server run seed
```

The seed script is idempotent — safe to re-run. It creates the admin account from
`ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` in `server/.env`.

## 5. Run both apps

```bash
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:3000
```

## 6. Verify

- `curl http://localhost:4000/health` → `{"status":"ok","db":"connected"}`
- Open `http://localhost:3000` — redirects to `/login`
- Sign up a student, submit a project
- Log in as the seeded admin, review the submission on the dashboard

## Common commands

| Command                               | Description                        |
| ------------------------------------- | ---------------------------------- |
| `npm run dev:client` / `dev:server`   | Run one app in dev mode            |
| `npm run lint:client` / `lint:server` | ESLint, one app                    |
| `npm run type-check`                  | `tsc --noEmit`, both apps          |
| `npm --prefix server run seed`        | Re-run the admin seed (idempotent) |
| `docker compose down`                 | Stop the local database            |

## Next steps

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to Vercel + Neon.
