import { Router } from "express";
import { MachineController } from "./machine.controller";

export class MachineRoutes {
  public router = Router();
  private controller = new MachineController();

  constructor() {
    /**
     * @openapi
     * /api/machines:
     *   get:
     *     tags: [Machines]
     *     summary: List machines with optional filters
     *     parameters:
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by machine category (e.g. Cutting Machines)
     *       - in: query
     *         name: isFeatured
     *         schema: { type: boolean }
     *         description: Filter featured machines only
     *     responses:
     *       200:
     *         description: Array of machine objects (specs is a parsed object)
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/machines/{id}:
     *   get:
     *     tags: [Machines]
     *     summary: Get a machine by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Machine object
     *       404:
     *         description: Not found
     */
    this.router.get("/:id", this.controller.getById);
  }
}
