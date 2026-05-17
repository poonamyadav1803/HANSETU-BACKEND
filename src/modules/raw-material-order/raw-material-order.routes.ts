import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { RawMaterialOrderController } from "./raw-material-order.controller";

export class RawMaterialOrderRoutes {
  public router = Router();
  private controller = new RawMaterialOrderController();

  constructor() {
    this.router.use(authMiddleware);

    this.router.get("/", this.controller.getAll);
    this.router.post("/", this.controller.create);
    this.router.patch("/:id/accept", this.controller.accept);
    this.router.post("/:id/problems", this.controller.reportProblem);
  }
}
