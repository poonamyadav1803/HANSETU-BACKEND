import { Router } from "express";
import { IndustryController } from "./industry.controller";

export class IndustryRoutes {
  public router = Router();
  private controller = new IndustryController();

  constructor() {
    /**
     * @openapi
     * /api/industries:
     *   get:
     *     tags: [Industries]
     *     summary: List all active industries
     *     responses:
     *       200:
     *         description: Array of industry objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id: { type: string, format: uuid }
     *                   slug: { type: string }
     *                   name: { type: string }
     *                   description: { type: string, nullable: true }
     *                   iconUrl: { type: string, nullable: true }
     *                   isActive: { type: boolean }
     *                   createdAt: { type: string, format: date-time }
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/industries/{slug}:
     *   get:
     *     tags: [Industries]
     *     summary: Get a single industry by slug
     *     parameters:
     *       - in: path
     *         name: slug
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Industry object
     *       404:
     *         description: Not found
     */
    this.router.get("/:slug", this.controller.getBySlug);
  }
}
