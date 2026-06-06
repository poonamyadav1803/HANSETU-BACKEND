import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireBuyer } from "../../middlewares/rbac.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { OrderController } from "./order.controller";

export class OrderRoutes {
  public router = Router();
  private controller = new OrderController();

  constructor() {
    this.router.get("/", authMiddleware, requireBuyer, this.controller.list);

    /**
     * @openapi
     * /api/orders:
     *   post:
     *     tags: [Orders]
     *     summary: Confirm an order from an accepted quote or sample
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [rfqId]
     *             properties:
     *               rfqId: { type: string, format: uuid }
     *               sourceType: { type: string, enum: [ACCEPTED_QUOTE, SAMPLE] }
     *               advancePayment:
     *                 type: object
     *                 properties:
     *                   amount: { type: number }
     *                   method: { type: string }
     *                   reference: { type: string }
     *               notes: { type: string }
     *     responses:
     *       201:
     *         description: Confirmed order created
     *       400:
     *         description: Validation or state error
     */
    this.router.post("/", authMiddleware, requireBuyer, this.controller.create);

    this.router.get("/:id", authMiddleware, requireBuyer, this.controller.getOne);
    this.router.patch(
      "/:id/advance-payment",
      authMiddleware,
      requireBuyer,
      this.controller.recordAdvancePayment
    );
  }
}

export class AdminOrderRoutes {
  public router = Router();
  private controller = new OrderController();

  constructor() {
    this.router.get("/orders", adminMiddleware, this.controller.adminList);
    this.router.get("/orders/:id", adminMiddleware, this.controller.adminGetOne);
    this.router.patch(
      "/orders/:id/phase5-documents",
      adminMiddleware,
      this.controller.adminUpdatePhase5Documents
    );
  }
}
