import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { SupplierInventoryController } from "./supplier-inventory.controller";

export class SupplierInventoryRoutes {
  public router = Router();
  private controller = new SupplierInventoryController();

  constructor() {
    this.router.use(authMiddleware);

    this.router.get("/", this.controller.getAll);
    this.router.post("/", this.controller.create);
    this.router.patch("/:id", this.controller.update);
    this.router.delete("/:id", this.controller.remove);
  }
}
