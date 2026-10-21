import { Router } from "express";
import rateLimit from "express-rate-limit";

import { asyncHandler } from "../middleware/async-handler";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSubmission } from "../services/submission.service";
import { createSubmissionSchema } from "../validators/submission";

const router = Router();

const createSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submission attempts, please try again later" },
});

router.post(
  "/",
  ...protect("STUDENT"),
  createSubmissionLimiter,
  validate(createSubmissionSchema),
  asyncHandler(async (req, res) => {
    const submission = await createSubmission(req.user!.id, req.body);
    res.status(201).json(submission);
  })
);

export default router;
