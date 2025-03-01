import {
  // downloadReceipt,
  stripePayment,
} from "../controllers/stripePayment.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import Stripe from "stripe";
import { captureOrder, createOrder } from "../controllers/paypal.controller.js";

const router = Router();

router.route("/stripe-checkout-session").post(stripePayment);

router.post("/create-order", createOrder);
router.post("/capture-order/:orderId", captureOrder);

export default router;
