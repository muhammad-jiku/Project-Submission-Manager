# Environment Variables

## `server`

See `server/.env.example` for the full template.

| Variable                                        | Description                                                                        | Local value                                                    | Production                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`                                  | Postgres connection string, used for normal app queries                            | Local Docker, port 5434                                        | Neon pooled (`POSTGRES_PRISMA_URL`)                     |
| `DIRECT_URL`                                    | Postgres connection string without a pooler, used only by `prisma migrate`         | Same as `DATABASE_URL` locally (no real pooler to distinguish) | Neon direct (`POSTGRES_URL_NON_POOLING`)                |
| `PORT`                                          | Port the Express server listens on locally                                         | `4000`                                                         | Set by Vercel automatically                             |
| `NODE_ENV`                                      | Standard Node environment flag; also controls the auth cookie's `secure` attribute | `development`                                                  | `production`                                            |
| `JWT_SECRET`                                    | Signing secret for session JWTs                                                    | Dev placeholder, fine to share                                 | **Must** be a fresh random value, never reused from dev |
| `JWT_EXPIRES_IN`                                | Session token lifetime                                                             | `7d`                                                           | `7d`                                                    |
| `CLIENT_URL`                                    | Frontend origin, used for CORS                                                     | `http://localhost:3000`                                        | The deployed frontend's Vercel URL                      |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials used by `npm run seed` to create the one admin account                 | Your own test values                                           | Real admin credentials                                  |

## `client`

| Variable              | Description                             | Local value                 | Production                                              |
| --------------------- | --------------------------------------- | --------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL the frontend calls for the API | `http://localhost:4000/api` | The deployed backend's Vercel URL, with `/api` appended |

## Setting production values

Never commit real production values — `server/.env` and `client/.env.local` are both gitignored.
Production env vars are set directly in each Vercel project's **Settings → Environment Variables**,
scoped to the Production environment. A newly added or edited env var requires a redeploy to take
effect.
