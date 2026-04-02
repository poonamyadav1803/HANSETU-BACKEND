import { Router } from "express";
import { ManufacturerController } from "./manufacturer.controller";

export class ManufacturerRoutes {
  public router = Router();
  private controller = new ManufacturerController();

  constructor() {
    /**
     * @openapi
     * /api/manufacturers:
     *   get:
     *     tags: [Manufacturers]
     *     summary: List manufacturers with optional industry filter
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug (e.g. automobile, aerospace)
     *     responses:
     *       200:
     *         description: Array of manufacturer objects (certifications and machineCapabilities are arrays)
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/manufacturers/{id}:
     *   get:
     *     tags: [Manufacturers]
     *     summary: Get a manufacturer by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Manufacturer object
     *       404:
     *         description: Not found
     */
    this.router.get("/:id", this.controller.getById);
  }
}
