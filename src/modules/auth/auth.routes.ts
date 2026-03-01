import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRoutes {
  public router = Router();
  private controller = new AuthController();

  constructor() {
    this.router.post("/signup", this.controller.signup);
    this.router.post("/login", this.controller.login);
  }
}