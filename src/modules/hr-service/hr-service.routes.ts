import { Router } from "express";
import { HrServiceController } from "./hr-service.controller";

export class HrServiceRoutes {
  public router = Router();
  private controller = new HrServiceController();

  constructor() {
    /**
     * @openapi
     * /api/hr-services:
     *   get:
     *     tags: [HR Services]
     *     summary: List HR services with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by category (e.g. Recruitment, Staffing)
     *     responses:
     *       200:
     *         description: Array of HR service objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/HrService'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/hr-services/{id}:
     *   get:
     *     tags: [HR Services]
     *     summary: Get an HR service by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: HR service object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HrService'
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
