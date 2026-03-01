import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";

const authService = new AuthService(new UserRepository());

export class AuthController {
  async signup(req: Request, res: Response) {
    const token = await authService.signup(req.body);
    res.status(201).json({ token });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.json({ token });
  }
}