# Submission Manager

A project submission and review dashboard. Students submit projects (name, repo URL, live link,
description) — any number of them, as long as the same repo isn't submitted twice by the same
student; mentors search and filter the queue by status, and approve or reject each one.

## Project structure

```
client/   Next.js 16 (App Router), TailwindCSS, ShadCN — student + mentor UI
server/   Express.js, Prisma, PostgreSQL — REST API, JWT auth, RBAC
```

`client` and `server` deploy to Vercel as **separate projects** — see
[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Tech stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, ShadCN UI, React Hook Form + Zod
- **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT-based RBAC
- **Tooling**: ESLint, Prettier, Husky + lint-staged

## Getting started

```bash
npm install
npm --prefix client install
npm --prefix server install
docker compose up -d
cp server/.env.example server/.env   # fill in real values
npm --prefix server run prisma:migrate
npm --prefix server run seed
npm run dev:client   # in one terminal
npm run dev:server   # in another
```

See [docs/QUICKSTART.md](./docs/QUICKSTART.md) for the full walkthrough.

## Documentation

- [QUICKSTART.md](./docs/QUICKSTART.md) — local setup, in full
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) — how each app deploys to Vercel, and the real issues hit
  along the way
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — every environment variable, both apps

## Scripts

| Command                               | Description                      |
| ------------------------------------- | -------------------------------- |
| `npm run dev:client` / `dev:server`   | Run one app in dev mode          |
| `npm run lint:client` / `lint:server` | ESLint, one app                  |
| `npm run type-check`                  | `tsc --noEmit`, both apps        |
| `npm run format`                      | Prettier, `*.{md,json,yml,yaml}` |

## Git hooks

Husky runs `lint-staged` on commit (lints changed files per-app, formats `*.{md,json,yml,yaml}`)
and `npm run type-check` before push.
