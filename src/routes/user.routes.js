import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  changeCurrentPassword,
  setPassword,
  forgotPassword,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/set-password/:id").post(setPassword);
router.route("/forgot-password").post(forgotPassword);
router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default router;
