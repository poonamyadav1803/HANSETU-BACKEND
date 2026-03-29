import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { signupSchema, loginSchema } from "./auth.schema";

const authService = new AuthService(new UserRepository());

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = signupSchema.parse(req.body);
      const token = await authService.signup(data);
      res.status(201).json({ token });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const token = await authService.login(email, password);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
}
