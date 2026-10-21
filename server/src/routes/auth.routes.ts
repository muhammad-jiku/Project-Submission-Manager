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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_MS,
    });

    res.status(200).json(user);
  })
);

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
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
