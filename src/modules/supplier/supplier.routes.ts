import { Router } from "express";
import { SupplierController } from "./supplier.controller";

export class SupplierRoutes {
  public router = Router();
  private controller = new SupplierController();

  constructor() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
  }
}
