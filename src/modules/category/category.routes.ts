import { Router } from "express";
import { CategoryController } from "./category.controller";

export class CategoryRoutes {
  public router = Router();
  private controller = new CategoryController();

  constructor() {
    /**
     * @openapi
     * /api/categories:
     *   get:
     *     tags: [Categories]
     *     summary: List all active categories with their subcategories
     *     responses:
     *       200:
     *         description: Array of category objects (each includes subcategories array)
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
     *                   primaryColor: { type: string, nullable: true }
     *                   secondaryColor: { type: string, nullable: true }
     *                   gradientColor: { type: string, nullable: true }
     *                   badgeColor: { type: string, nullable: true }
     *                   isActive: { type: boolean }
     *                   subcategories:
     *                     type: array
     *                     items:
     *                       type: object
     *                       properties:
     *                         id: { type: string, format: uuid }
     *                         categoryId: { type: string, format: uuid }
     *                         name: { type: string }
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/categories/{slug}:
     *   get:
     *     tags: [Categories]
     *     summary: Get a category by slug with its subcategories
     *     parameters:
     *       - in: path
     *         name: slug
     *         required: true
     *         schema: { type: string }
     *         example: electrical
     *     responses:
     *       200:
     *         description: Category with subcategories
     *       404:
     *         description: Category not found
     */
    this.router.get("/:slug", this.controller.getBySlug);
  }
}
