import { Router } from 'express';
import { CategoryController } from './category.controller';

export class CategoryRoutes {
  public router = Router();
  private controller = new CategoryController();
  private uuidParam = ':id([0-9a-fA-F-]{36})';

  constructor() {
    /**
     * @openapi
     * /api/categories:
     *   post:
     *     tags: [Categories]
     *     summary: Create a category
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CategoryCreateRequest'
     *     responses:
     *       201:
     *         description: Category created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Category'
     *       400:
     *         description: Validation failed or slug already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
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
     *                 $ref: '#/components/schemas/Category'
     */
    this.router.get('/', this.controller.getAll);
    this.router.post('/', this.controller.create);

    /**
     * @openapi
     * /api/categories/{id}:
     *   get:
     *     tags: [Categories]
     *     summary: Get a category by ID with its subcategories
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Category with subcategories
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Category'
     *       404:
     *         description: Category not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get(`/${this.uuidParam}`, this.controller.getById);

    /**
     * @openapi
     * /api/categories/slug/{slug}:
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Category'
     *       404:
     *         description: Category not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get('/slug/:slug', this.controller.getBySlug);
    this.router.get('/:slug', this.controller.getBySlug);

    /**
     * @openapi
     * /api/categories/{id}:
     *   patch:
     *     tags: [Categories]
     *     summary: Update a category by ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CategoryUpdateRequest'
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Updated category
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Category'
     *       400:
     *         description: Validation failed or slug already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Category not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.patch(`/${this.uuidParam}`, this.controller.update);

    /**
     * @openapi
     * /api/categories/{id}:
     *   delete:
     *     tags: [Categories]
     *     summary: Delete a category by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Category deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Category deleted successfully
     *       404:
     *         description: Category not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.delete(`/${this.uuidParam}`, this.controller.delete);
  }
}
