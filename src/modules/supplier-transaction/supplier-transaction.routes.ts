import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { SupplierTransactionController } from "./supplier-transaction.controller";

export class SupplierTransactionRoutes {
  public router = Router();
  private controller = new SupplierTransactionController();

  constructor() {
    this.router.use(authMiddleware);

    this.router.get("/", this.controller.getAll);
    this.router.post("/", this.controller.create);
  }
}
