import { Router } from "express";
import rateLimit from "express-rate-limit";

import { asyncHandler } from "../middleware/async-handler";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { validate } from "../middleware/validate";
import { prisma } from "../lib/prisma";
import { signInUser, signupStudent } from "../services/auth.service";
import { loginSchema, signupSchema } from "../validators/auth";

const router = Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many signup attempts, please try again later" },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" },
});

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

// In production, the frontend and backend live on different *.vercel.app
// subdomains, which Vercel registers as separate "sites" for cookie
// purposes. A SameSite=Lax cookie is never attached to background fetch()
// calls across different sites (only top-level navigation), so the
// frontend's calls to protected routes would always look unauthenticated.
// SameSite=None (which requires Secure) is required for this to work.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
};

router.post(
  "/signup",
  signupLimiter,
  validate(signupSchema),
  asyncHandler(async (req, res) => {
    const user = await signupStudent(req.body);
    res.status(201).json(user);
  })
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { token, user } = await signInUser(req.body);

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: COOKIE_MAX_AGE_MS,
    });

    res.status(200).json(user);
  })
);

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(200).json({ message: "Logged out" });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new AppError(401, "Not authenticated");
    }

    res.status(200).json(user);
  })
);

export default router;
