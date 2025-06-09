import { Router } from "express";
import { limiter, speedLimiter } from "./utils.mjs";

import {
  userRouter as UserRouter,
  authRouter as AuthRouter,
} from "./userApp/router.mjs";
import AuthCtrl from "./userApp/authController.mjs";
import AppointmentRouter from "./appointmentApp/router.mjs";
import ChatRouter from "./chatApp/router.mjs";

const router = new Router();

router.get("/", limiter, speedLimiter, (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

// Authorize user for all requests except for paths starting with '/auth'.
router.use("/", AuthCtrl.authorizeSession);

router.use("/auth", AuthRouter);
router.use("/users", UserRouter);
router.use("/appointments", AppointmentRouter);
router.use("/chats", ChatRouter);

export default router;
