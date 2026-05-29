import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { UserAddressController } from "./user-address.controller";

export class UserAddressRoutes {
  public router = Router();
  private controller = new UserAddressController();

  constructor() {
    this.router.use(authMiddleware);
    this.router.get("/", this.controller.getAll);
    this.router.post("/", this.controller.create);
    this.router.patch("/:id/default", this.controller.setDefault);
    this.router.delete("/:id", this.controller.remove);
  }
}
