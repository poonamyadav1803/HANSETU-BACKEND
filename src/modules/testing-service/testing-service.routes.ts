import { Router } from "express";
import { TestingServiceController } from "./testing-service.controller";

export class TestingServiceRoutes {
  public router = Router();
  private controller = new TestingServiceController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
