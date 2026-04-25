import { Router } from "express";
import { StudentServiceController } from "./student-service.controller";

export class StudentServiceRoutes {
  public router = Router();
  private controller = new StudentServiceController();

  constructor() {
    /**
     * @openapi
     * /api/student-services:
     *   get:
     *     tags: [Student Services]
     *     summary: List student services (internships, apprenticeships) with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by category (e.g. Internship, Apprenticeship)
     *     responses:
     *       200:
     *         description: Array of student service objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/StudentService'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/student-services/{id}:
     *   get:
     *     tags: [Student Services]
     *     summary: Get a student service by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Student service object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StudentService'
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
