import { Router } from "express";

import { authRouter } from "./auth.router";
// import piyachokRouter from "./piyachok.router";
import placeRouter from "./place.router";
// import reviewRouter from "./review.router";
import { userRouter } from "./user.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/places", placeRouter);
router.use("/users", userRouter);
// router.use("/reviews", reviewRouter);
// router.use("/piyachok", piyachokRouter);

export const apiRouter = router;
