import { Router } from "express";
import { TrainingProgramController } from "./training-program.controller";

export class TrainingProgramRoutes {
  public router = Router();
  private controller = new TrainingProgramController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
