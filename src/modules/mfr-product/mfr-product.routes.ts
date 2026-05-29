import { Router } from "express";
import { MfrProductController } from "./mfr-product.controller";

export class MfrProductRoutes {
  public router = Router();
  private controller = new MfrProductController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
