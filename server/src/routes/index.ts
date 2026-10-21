import { Router } from "express";

import authRouter from "./auth.routes";
import reviewRouter from "./review.routes";
import submissionRouter from "./submission.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/submissions", submissionRouter);
router.use("/review", reviewRouter);

export default router;
