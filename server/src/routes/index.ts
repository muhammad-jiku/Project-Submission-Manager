import { Router } from "express";

import authRouter from "./auth.routes";

const router = Router();

router.use("/auth", authRouter);
// router.use("/submissions", submissionsRouter);
// router.use("/review", reviewRouter);

export default router;
