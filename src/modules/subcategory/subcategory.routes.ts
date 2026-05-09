import { Router } from 'express';
import { SubcategoryController } from './subcategory.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';

export class SubcategoryRoutes {
  public router = Router();
  private controller = new SubcategoryController();
  private uuidParam = ':id([0-9a-fA-F-]{36})';

  constructor() {
    /**
     * @openapi
     * /api/subcategories:
     *   post:
     *     tags: [Subcategories]
     *     summary: Create a subcategory
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SubcategoryCreateRequest'
     *     responses:
     *       201:
     *         description: Subcategory created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SubcategoryWithCategory'
     *       400:
     *         description: Validation failed, category not found, or duplicate name
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *   get:
     *     tags: [Subcategories]
     *     summary: List subcategories with optional category filter
     *     parameters:
     *       - in: query
     *         name: categoryId
     *         schema: { type: string, format: uuid }
     *         description: Filter by category UUID
     *     responses:
     *       200:
     *         description: Array of subcategory objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/SubcategoryWithCategory'
     */
    this.router.get('/', this.controller.getAll);
    this.router.post('/', authMiddleware, requireAdmin, this.controller.create);

    /**
     * @openapi
     * /api/subcategories/{id}:
     *   get:
     *     tags: [Subcategories]
     *     summary: Get a subcategory by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Subcategory object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SubcategoryWithCategory'
     *       404:
     *         description: Subcategory not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *   patch:
     *     tags: [Subcategories]
     *     summary: Update a subcategory by ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SubcategoryUpdateRequest'
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Updated subcategory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SubcategoryWithCategory'
     *       400:
     *         description: Validation failed, category not found, or duplicate name
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Subcategory not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *   delete:
     *     tags: [Subcategories]
     *     summary: Delete a subcategory by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Subcategory deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Subcategory deleted successfully
     *       404:
     *         description: Subcategory not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get(`/${this.uuidParam}`, this.controller.getById);
    this.router.patch(`/${this.uuidParam}`, authMiddleware, requireAdmin, this.controller.update);
    this.router.delete(`/${this.uuidParam}`, authMiddleware, requireAdmin, this.controller.delete);
  }
}
