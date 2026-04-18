import { Router } from "express";
import { FinancialServiceController } from "./financial-service.controller";

export class FinancialServiceRoutes {
  public router = Router();
  private controller = new FinancialServiceController();

  constructor() {
    /**
     * @openapi
     * /api/financial-services:
     *   get:
     *     tags: [Financial Services]
     *     summary: List financial services with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by category (e.g. Loans, Insurance, Leasing)
     *     responses:
     *       200:
     *         description: Array of financial service objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FinancialService'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/financial-services/{id}:
     *   get:
     *     tags: [Financial Services]
     *     summary: Get a financial service by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Financial service object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FinancialService'
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
