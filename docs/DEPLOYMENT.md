# Deployment

`client` and `server` deploy to Vercel as **two separate projects** from the same repo, each with
its own Root Directory setting. The database is Neon Postgres (provisioned via Vercel's Storage
integration), separate from both.

## `server` (Express, as a Vercel serverless function)

Vercel's `@vercel/node` builder runs an Express app directly — an Express app instance is itself a
valid `(req, res)` handler, no framework rewrite needed. `server/vercel.json` routes every request
to `server/src/vercel.ts`, a thin entrypoint that re-exports the Express `app`.

1. **Add New → Project**, import the repo, set **Root Directory** to `server`
2. Vercel detects `vercel.json` and uses its `builds`/`routes` config automatically
3. Environment variables (Production scope, at minimum):
   `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production`,
   `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — see [ENVIRONMENT.md](./ENVIRONMENT.md)
4. Deploy, then verify: `curl https://<backend-url>/health` → `{"status":"ok","db":"connected"}`

### Issues actually hit deploying this (and the fixes)

- **`@prisma/client did not initialize yet`** — the generated Prisma client wasn't present for
  Vercel's Linux build environment. Fixed by adding an explicit `"postinstall": "prisma generate"`
  script to `server/package.json` (Prisma's own documented recommendation for serverless deploys —
  don't rely on `@prisma/client`'s own postinstall hook firing correctly in every build sandbox).
- **`express-rate-limit` `ValidationError`s** (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`,
  `ERR_ERL_FORWARDED_HEADER`) — Vercel sits behind a proxy and sets `X-Forwarded-For`, but Express's
  `trust proxy` was never enabled. Fixed with `app.set("trust proxy", 1)`.
- **`db: "unreachable"` with no visible error** — the `/health` handler's `catch` block was empty,
  silently swallowing the real Prisma error. Added `console.error` logging; when Vercel's log
  pipeline still didn't surface it reliably, temporarily returned the error `message` directly in
  the response body instead — far more reliable than depending on log delivery/correlation.
- **The actual root cause, once visible**: `DATABASE_URL` on the Vercel project had been set to the
  _local Docker_ connection string instead of the Neon one — an easy copy-paste mix-up, since both
  lines sit next to each other in `.env`. Fixed by correcting the value and re-confirming the
  Production environment scope (it had also briefly gone fully unset while resolving a conflict
  with Neon's own "Connect a Project" integration dialog — cancel that dialog if it appears and
  edit the existing `DATABASE_URL`/`DIRECT_URL` vars directly instead, since the integration flow
  injects prefixed variable names like `STORAGE_DATABASE_URL` that the app doesn't read).

### A known limitation, not fixed

`express-rate-limit`'s default store keeps counts in memory. On Vercel's serverless functions, each
invocation can land on a different underlying instance, so the in-memory counter doesn't stay
consistent across requests — rate limits undercount in practice (a soft limit, not a security
hole). Not a blocker at this project's scale; the fix if it matters later is a shared store
(`rate-limit-redis` backed by Upstash).

## `client` (Next.js)

1. **Add New → Project** again, same repo, **Root Directory** set to `client`
2. Vercel auto-detects Next.js, no build/start command changes needed
3. Environment variable: `NEXT_PUBLIC_API_URL` — the backend URL from above, with `/api` appended
4. Deploy, then go back to the `server` project and set `CLIENT_URL` to this frontend's URL
   (needed for CORS), redeploy the backend

## Database (Neon via Vercel)

Provisioned from the **Storage** tab (Create Database → Neon/Postgres). Auth and Realtime add-ons
left off — this app has its own JWT-based auth, nothing uses Neon's. Two connection strings
matter:

- **Pooled** (`POSTGRES_PRISMA_URL`, has `-pooler` in the hostname) → `DATABASE_URL`, used for
  normal app queries
- **Direct** (`POSTGRES_URL_NON_POOLING`, no `-pooler`) → `DIRECT_URL`, used by `prisma migrate`

Run migrations/seed against production by temporarily pointing a local `.env` at the production
connection strings, running `npm --prefix server run prisma:migrate` / `npm --prefix server run
seed`, then switching back to the local Docker values.

## Local equivalents

| Production                               | Local                                       |
| ---------------------------------------- | ------------------------------------------- |
| Neon Postgres                            | Docker Postgres (`docker-compose.yml`)      |
| `server/vercel.json` serverless function | `npm --prefix server run dev` (`tsx watch`) |
| Vercel-hosted Next.js                    | `npm --prefix client run dev`               |
