import { Router } from "express";
import * as ctrl from "./payment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

export class PaymentRoutes {
  public router = Router();

  constructor() {
    // Create Razorpay order (authenticated buyer)
    this.router.post("/create-order", authMiddleware, ctrl.createOrder);

    // Verify payment signature after checkout
    this.router.post("/verify", authMiddleware, ctrl.verifyPayment);
  }
}
