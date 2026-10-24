import { Router } from "express";
import rateLimit from "express-rate-limit";

import { asyncHandler } from "../middleware/async-handler";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSubmission, getMySubmissions } from "../services/submission.service";
import { createSubmissionSchema, listMySubmissionsQuerySchema } from "../validators/submission";

const router = Router();

const createSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submission attempts, please try again later" },
});

router.get(
  "/me",
  ...protect("STUDENT"),
  asyncHandler(async (req, res) => {
    const query = listMySubmissionsQuerySchema.parse(req.query);
    const result = await getMySubmissions(req.user!.id, query);
    res.status(200).json(result);
  })
);

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
