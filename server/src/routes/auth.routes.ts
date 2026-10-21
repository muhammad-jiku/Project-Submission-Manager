import { Router } from "express";
import rateLimit from "express-rate-limit";

import { asyncHandler } from "../middleware/async-handler";
import { validate } from "../middleware/validate";
import { signupStudent } from "../services/auth.service";
import { signupSchema } from "../validators/auth";

const router = Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many signup attempts, please try again later" },
});

router.post(
  "/signup",
  signupLimiter,
  validate(signupSchema),
  asyncHandler(async (req, res) => {
    const user = await signupStudent(req.body);
    res.status(201).json(user);
  })
);

export default router;
