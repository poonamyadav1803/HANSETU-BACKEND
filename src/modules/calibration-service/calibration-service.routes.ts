import { Router } from "express";
import { CalibrationServiceController } from "./calibration-service.controller";

export class CalibrationServiceRoutes {
  public router = Router();
  private controller = new CalibrationServiceController();

  constructor() {
    /**
     * @openapi
     * /api/calibration-services:
     *   get:
     *     tags: [Calibration Services]
     *     summary: List calibration services with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug (e.g. automobile, aerospace)
     *       - in: query
     *         name: city
     *         schema: { type: string }
     *         description: Filter by city
     *     responses:
     *       200:
     *         description: Array of calibration service objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CalibrationService'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/calibration-services/{id}:
     *   get:
     *     tags: [Calibration Services]
     *     summary: Get a calibration service by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Calibration service object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CalibrationService'
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
