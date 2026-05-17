import { Router } from "express";
import { ManufacturerController } from "./manufacturer.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

export class ManufacturerRoutes {
  public router = Router();
  private controller = new ManufacturerController();

  constructor() {
    /**
     * @openapi
     * /api/manufacturers:
     *   get:
     *     tags: [Manufacturers]
     *     summary: List manufacturers with optional catalog filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug (e.g. automobile, aerospace)
     *       - in: query
     *         name: city
     *         schema: { type: string }
     *         description: Filter by city
     *       - in: query
     *         name: state
     *         schema: { type: string }
     *         description: Filter by state
     *       - in: query
     *         name: inHouseTesting
     *         schema: { type: boolean }
     *         description: Filter by in-house testing availability
     *       - in: query
     *         name: importExport
     *         schema: { type: boolean }
     *         description: Filter by import/export capability
     *       - in: query
     *         name: certification
     *         schema: { type: string }
     *         description: Filter by certification text (e.g. ISO 9001, AS9100)
     *       - in: query
     *         name: machineCapability
     *         schema: { type: string }
     *         description: Filter by machine/capability text (e.g. CNC, EDM)
     *       - in: query
     *         name: minRating
     *         schema: { type: string }
     *         description: Minimum rating (e.g. 4.5)
     *       - in: query
     *         name: search
     *         schema: { type: string }
     *         description: Search industry, location, certifications, and capabilities
     *     responses:
     *       200:
     *         description: Array of manufacturer objects (certifications and machineCapabilities are arrays)
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Manufacturer'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/manufacturers/me/stats:
     *   get:
     *     tags: [Manufacturers]
     *     summary: Dashboard stats for the authenticated manufacturer
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Dashboard statistics
     */
    this.router.get("/me/stats", authMiddleware, this.controller.getDashboardStats);

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
