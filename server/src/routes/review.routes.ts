import { Router } from "express";

import { asyncHandler } from "../middleware/async-handler";
import { protect } from "../middleware/auth";
import {
  getSubmissionStats,
  listSubmissions,
  updateSubmissionStatus,
} from "../services/review.service";
import { listSubmissionsQuerySchema } from "../validators/submission";

const router = Router();

router.use(...protect("ADMIN"));

router.get(
  "/submissions",
  asyncHandler(async (req, res) => {
    const query = listSubmissionsQuerySchema.parse(req.query);
    const result = await listSubmissions(query);
    res.status(200).json(result);
  })
);

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = await getSubmissionStats();
    res.status(200).json(stats);
  })
);

router.patch(
  "/submissions/:id/approve",
  asyncHandler(async (req, res) => {
    const submission = await updateSubmissionStatus(String(req.params.id), "APPROVED");
    res.status(200).json(submission);
  })
);

router.patch(
  "/submissions/:id/reject",
  asyncHandler(async (req, res) => {
    const submission = await updateSubmissionStatus(String(req.params.id), "REJECTED");
    res.status(200).json(submission);
  })
);

export default router;
