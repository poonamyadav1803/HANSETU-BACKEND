import { Router } from "express";
import { SupplierController } from "./supplier.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

export class SupplierRoutes {
  public router = Router();
  private controller = new SupplierController();

  constructor() {
    /**
     * @openapi
     * /api/suppliers:
     *   get:
     *     tags: [Suppliers]
     *     summary: List raw material suppliers with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug (e.g. aerospace, automobile)
     *       - in: query
     *         name: materialCategory
     *         schema: { type: string }
     *         description: Filter by material category (e.g. Aluminum, Steel)
     *     responses:
     *       200:
     *         description: Array of supplier objects (materials and certifications are arrays)
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Supplier'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/suppliers/me/stats:
     *   get:
     *     tags: [Suppliers]
     *     summary: Dashboard stats for the authenticated supplier
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Dashboard statistics
     */
    this.router.get("/me/stats", authMiddleware, this.controller.getDashboardStats);

    /**
     * @openapi
     * /api/suppliers/{id}:
     *   get:
     *     tags: [Suppliers]
     *     summary: Get a supplier by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Supplier object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Supplier'
     *       404:
     *         description: Not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get("/:id", this.controller.getById);
  }
}

export class AdminSupplierRoutes {
  public router = Router();
  private controller = new SupplierController();

  constructor() {
    /**
     * @openapi
     * /api/admin/suppliers/search:
     *   get:
     *     tags: [Admin - Suppliers]
     *     summary: Search registered suppliers for RFQ assignment
     *     security:
     *       - adminAuth: []
     *     parameters:
     *       - in: query
     *         name: query
     *         schema: { type: string }
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *       - in: query
     *         name: capability
     *         schema: { type: string }
     *       - in: query
     *         name: location
     *         schema: { type: string }
     *       - in: query
     *         name: certification
     *         schema: { type: string }
     *       - in: query
     *         name: moqLte
     *         schema: { type: number }
     *     responses:
     *       200:
     *         description: Ranked supplier candidates for admin matching
     */
    this.router.get("/suppliers/search", adminMiddleware, this.controller.adminSearch);
    this.router.get("/suppliers-list", adminMiddleware, this.controller.adminSearch);
  }
}
