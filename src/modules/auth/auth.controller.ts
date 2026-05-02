import { Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  signupSchema,
  loginSchema,
  gstVerifySchema,
  sendPhoneOtpSchema,
  verifyPhoneOtpSchema,
  sendEmailOtpSchema,
  verifyEmailOtpSchema,
  updateProfileSchema,
  completeRegistrationSchema,
} from "./auth.schema";

const authService = new AuthService(new UserRepository());

export class AuthController {
  async signup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: any = signupSchema.parse(req.body);
      const result = await authService.signup(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.userId!);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async completeRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = completeRegistrationSchema.parse(req.body);
      const user = await authService.completeRegistration(req.userId!, data);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(req.userId!, profile);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async checkUsername(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const result = await authService.checkUsername(username);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async gstVerify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { gstNumber } = gstVerifySchema.parse(req.body);
      const result = await authService.gstVerify(gstNumber);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async sendEmailOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email } = sendEmailOtpSchema.parse(req.body);
      await authService.sendEmailOtp(email);
      res.json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmailOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, otp } = verifyEmailOtpSchema.parse(req.body);
      const otpToken = await authService.verifyEmailOtp(email, otp);
      res.json({ success: true, otpToken });
    } catch (err) {
      next(err);
    }
  }

  async sendPhoneOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { mobile } = sendPhoneOtpSchema.parse(req.body);
      await authService.sendPhoneOtp(mobile);
      res.json({ success: true, message: "OTP sent to mobile" });
    } catch (err) {
      next(err);
    }
  }

  async verifyPhoneOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { mobile, otp } = verifyPhoneOtpSchema.parse(req.body);
      const valid = await authService.verifyPhoneOtp(mobile, otp);
      if (!valid) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }
      res.json({ success: true, message: "Phone OTP verified" });
    } catch (err) {
      next(err);
    }
  }
}
