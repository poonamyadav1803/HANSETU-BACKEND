import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { AutoOrderController } from "./auto-order.controller";

export class AutoOrderRoutes {
  public router = Router();
  private controller = new AutoOrderController();

  constructor() {
    this.router.use(authMiddleware);
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.getById);
    this.router.post("/", this.controller.create);
  }
}
