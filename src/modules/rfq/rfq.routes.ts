import { Router } from "express";
import multer from "multer";
import { RfqController } from "./rfq.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireBuyer, requireAdmin } from "../../middlewares/rbac.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: 10 * 1024 * 1024 }, // 5 files, 10 MB each
});

export class RfqRoutes {
  public router = Router();
  private controller = new RfqController();

  constructor() {
    /**
     * @openapi
     * /api/rfq:
     *   post:
     *     tags: [RFQ]
     *     summary: Submit a new RFQ (buyer)
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required: [productName, category, quantity, deliveryLocation]
     *             properties:
     *               productName: { type: string }
     *               category: { type: string }
     *               quantity: { type: number }
     *               unit: { type: string }
     *               deliveryLocation: { type: string }
     *               requiredBy: { type: string }
     *               specs: { type: string }
     *               orderType: { type: string, enum: [SAMPLE, BULK] }
     *               attachments:
     *                 type: array
     *                 items: { type: string, format: binary }
     *     responses:
     *       201:
     *         description: RFQ created
     *       400:
     *         description: Validation error
     */
    this.router.post(
      "/",
      authMiddleware,
      requireBuyer,
      upload.array("attachments", 5),
      this.controller.submit
    );

    /**
     * @openapi
     * /api/rfq/my:
     *   get:
     *     tags: [RFQ]
     *     summary: Get all RFQs submitted by the authenticated buyer
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Array of RFQs with assignment info
     */
    this.router.get("/my", authMiddleware, requireBuyer, this.controller.getMy);

    /**
     * @openapi
     * /api/rfq/{id}:
     *   get:
     *     tags: [RFQ]
     *     summary: Get a single RFQ by ID (buyer sees only their own)
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: RFQ detail
     *       404:
     *         description: Not found
     */
    this.router.get("/:id", authMiddleware, requireBuyer, this.controller.getOne);
  }
}

export class AdminRfqRoutes {
  public router = Router();
  private controller = new RfqController();

  constructor() {
    /**
     * @openapi
     * /api/admin/rfqs:
     *   get:
     *     tags: [Admin - RFQ]
     *     summary: List all RFQs (admin)
     *     security:
     *       - adminAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema: { type: string }
     *         description: Filter by RFQ status
     *     responses:
     *       200:
     *         description: Array of RFQs with buyer and assignment data
     */
    this.router.get("/rfqs", adminMiddleware, this.controller.adminGetAll);

    /**
     * @openapi
     * /api/admin/rfqs/{id}:
     *   get:
     *     tags: [Admin - RFQ]
     *     summary: Get a single RFQ with full detail (admin)
     *     security:
     *       - adminAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: RFQ detail
     *       404:
     *         description: Not found
     */
    this.router.get("/rfqs/:id", adminMiddleware, this.controller.adminGetOne);
  }
}
