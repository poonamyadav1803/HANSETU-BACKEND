import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRoutes {
  public router = Router();
  private controller = new AuthController();

  constructor() {
    this.router.post("/signup", this.controller.signup);
    this.router.post("/login", this.controller.login);
    this.router.post("/gst-verify", this.controller.gstVerify);
    this.router.post("/send-email-otp", this.controller.sendEmailOtp);
    this.router.post("/verify-email-otp", this.controller.verifyEmailOtp);
    // Phone OTP — wired for future use / mobile app
    this.router.post("/send-phone-otp", this.controller.sendPhoneOtp);
    this.router.post("/verify-phone-otp", this.controller.verifyPhoneOtp);
  }
}
