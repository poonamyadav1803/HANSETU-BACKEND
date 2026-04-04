import { Router } from "express";
import { HrServiceController } from "./hr-service.controller";

export class HrServiceRoutes {
  public router = Router();
  private controller = new HrServiceController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
