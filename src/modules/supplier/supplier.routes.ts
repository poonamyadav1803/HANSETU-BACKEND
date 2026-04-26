import { Router } from "express";
import { SupplierController } from "./supplier.controller";

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
