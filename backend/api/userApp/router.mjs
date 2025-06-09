import { Router } from "express";
import UserCtrl from "./userController.mjs";
import AuthCtrl from "./authController.mjs";

const authRouter = new Router();
const userRouter = new Router();

// Authentication Router
authRouter.route("/register").post(AuthCtrl.register);

authRouter.route("/signin").post(AuthCtrl.signIn);

authRouter.route("/signout").get(AuthCtrl.signOut);

authRouter.route("/password").put(AuthCtrl.updatePassword);

// User Router
userRouter.route("/").get(UserCtrl.getUsers);

userRouter
  .route("/:username")
  .get(UserCtrl.getUser)
  .delete(UserCtrl.deleteUser)
  .put(UserCtrl.updateUser);
userRouter
  .route("/:username/services")
  .get(UserCtrl.getServices)
  .post(UserCtrl.addService);

userRouter.route("/:username/services/:id").delete(UserCtrl.deleteService);
userRouter.route("/:username/medications").get(UserCtrl.getMedications);

export { authRouter, userRouter };
