import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import {
  signupSchema,
  loginSchema,
  gstVerifySchema,
  sendPhoneOtpSchema,
  verifyPhoneOtpSchema,
  sendEmailOtpSchema,
  verifyEmailOtpSchema,
} from "./auth.schema";

const authService = new AuthService(new UserRepository());

export class AuthController {
  // POST /api/auth/signup
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = signupSchema.parse(req.body);
      const token = await authService.signup(data);
      res.status(201).json({ token });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({
        success: false,
        message: "Something went wrong during signup. Please try again later."
      });
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const token = await authService.login(email, password);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/gst-verify
  async gstVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const { gstNumber } = gstVerifySchema.parse(req.body);
      const result = await authService.gstVerify(gstNumber);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/send-email-otp
  async sendEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = sendEmailOtpSchema.parse(req.body);
      await authService.sendEmailOtp(email);
      res.json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
      console.error("Send OTP email error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again."
      });
    }
  }

  // POST /api/auth/verify-email-otp  →  returns otpToken
  async verifyEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = verifyEmailOtpSchema.parse(req.body);
      const otpToken = await authService.verifyEmailOtp(email, otp);
      res.json({ success: true, otpToken });
    } catch (err) {
      console.error("Verify OTP email error:", err);
      res.status(500).json({
        success: false,
        message: "OTP verification failed. Please try again."
      });
    }
  }

  // ── Phone OTP endpoints (available for future use / mobile app) ────────────

  // POST /api/auth/send-phone-otp
  async sendPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobile } = sendPhoneOtpSchema.parse(req.body);
      await authService.sendPhoneOtp(mobile);
      res.json({ success: true, message: "OTP sent to mobile" });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/verify-phone-otp
  async verifyPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobile, otp } = verifyPhoneOtpSchema.parse(req.body);
      const valid = await authService.verifyPhoneOtp(mobile, otp);
      if (!valid) {
        res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        return;
      }
      res.json({ success: true, message: "Phone OTP verified" });
    } catch (err) {
      next(err);
    }
  }
}
