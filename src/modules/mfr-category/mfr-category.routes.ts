import { Router } from "express";
import { MfrCategoryController } from "./mfr-category.controller";

export class MfrCategoryRoutes {
  public router = Router();
  private controller = new MfrCategoryController();

  constructor() {
    this.router.get("/", this.controller.getByIndustry);
    this.router.get("/:id", this.controller.getById);
  }
}
