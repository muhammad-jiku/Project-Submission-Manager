import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";

import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { prisma } from "./lib/prisma";
import routes from "./routes";

const app = express();

// Vercel (and most PaaS hosts) sit behind a proxy; trusting it lets Express
// and express-rate-limit read the real client IP from X-Forwarded-For.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("Health check DB connection failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(503).json({ status: "error", db: "unreachable", message });
  }
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
