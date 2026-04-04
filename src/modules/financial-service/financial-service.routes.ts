import { Router } from "express";
import { FinancialServiceController } from "./financial-service.controller";

export class FinancialServiceRoutes {
  public router = Router();
  private controller = new FinancialServiceController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
