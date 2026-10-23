import "dotenv/config";

import app from "./app";

/**
 * Vercel serverless entrypoint. An Express app instance is itself a valid
 * (req, res) handler, so @vercel/node can invoke it directly — no adapter
 * needed. Prisma connects lazily per-query, so no explicit connect call
 * is required here either.
 */
export default app;
