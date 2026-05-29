import { Router } from "express";
import { MfrIndustryController } from "./mfr-industry.controller";

export class MfrIndustryRoutes {
  public router = Router();
  private controller = new MfrIndustryController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:slug", this.controller.getBySlug);
  }
}
