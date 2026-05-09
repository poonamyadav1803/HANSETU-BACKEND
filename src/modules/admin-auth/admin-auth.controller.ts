import { Response, NextFunction } from "express";
import { z } from "zod";
import { AdminRequest } from "../../middlewares/admin.middleware";
import { AdminAuthService } from "./admin-auth.service";
import { AdminUserRepository } from "./admin-user.repository";

const adminAuthService = new AdminAuthService(new AdminUserRepository());

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  token: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(4),
  password: z.string().min(8),
});

const inviteSchema = z.object({
  email: z.string().email(),
});

export class AdminAuthController {
  async me(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const admin = await adminAuthService.me(req.adminId!);
      res.json(admin);
    } catch (err) {
      next(err);
    }
  }

  async login(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await adminAuthService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async validateInviteToken(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await adminAuthService.validateInviteToken(token);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async register(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await adminAuthService.register(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async inviteAdmin(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { email } = inviteSchema.parse(req.body);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const result = await adminAuthService.inviteAdmin(email, req.adminId!, frontendUrl);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPendingRegistrations(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminAuthService.getPendingRegistrations();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async approveRegistration(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminAuthService.approveRegistration(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
