import { Router } from "express";
import { StudentServiceController } from "./student-service.controller";

export class StudentServiceRoutes {
  public router = Router();
  private controller = new StudentServiceController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
