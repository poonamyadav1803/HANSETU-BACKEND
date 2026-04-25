import { Router } from "express";
import { TestingServiceController } from "./testing-service.controller";

export class TestingServiceRoutes {
  public router = Router();
  private controller = new TestingServiceController();

  constructor() {
    /**
     * @openapi
     * /api/testing-services:
     *   get:
     *     tags: [Testing Services]
     *     summary: List testing services with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by service category (e.g. Mechanical, Chemical)
     *     responses:
     *       200:
     *         description: Array of testing service objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/TestingService'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/testing-services/{id}:
     *   get:
     *     tags: [Testing Services]
     *     summary: Get a testing service by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Testing service object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TestingService'
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
