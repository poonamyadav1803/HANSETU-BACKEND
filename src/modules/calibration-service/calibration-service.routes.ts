import { Router } from "express";
import { CalibrationServiceController } from "./calibration-service.controller";

export class CalibrationServiceRoutes {
  public router = Router();
  private controller = new CalibrationServiceController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
