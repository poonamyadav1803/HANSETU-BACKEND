import { Router } from "express";
import { TrainingProgramController } from "./training-program.controller";

export class TrainingProgramRoutes {
  public router = Router();
  private controller = new TrainingProgramController();

  constructor() {
    /**
     * @openapi
     * /api/training-programs:
     *   get:
     *     tags: [Training Programs]
     *     summary: List training programs with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by program category
     *       - in: query
     *         name: mode
     *         schema: { type: string }
     *         description: Filter by delivery mode (e.g. Online, Offline)
     *     responses:
     *       200:
     *         description: Array of training program objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/TrainingProgram'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/training-programs/{id}:
     *   get:
     *     tags: [Training Programs]
     *     summary: Get a training program by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Training program object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TrainingProgram'
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
