import { Router } from 'express';
import { ProductController } from './product.controller';

export class ProductRoutes {
  public router = Router();
  private controller = new ProductController();

  constructor() {
    /**
     * @openapi
     * /api/products:
     *   get:
     *     tags: [Products]
     *     summary: List products with optional filters
     *     parameters:
     *       - in: query
     *         name: categoryId
     *         schema: { type: string, format: uuid }
     *         description: Filter by category UUID
     *       - in: query
     *         name: subcategoryId
     *         schema: { type: string, format: uuid }
     *         description: Filter by subcategory UUID
     *       - in: query
     *         name: inStock
     *         schema: { type: boolean }
     *         description: Filter by stock availability
     *     responses:
     *       200:
     *         description: Array of product objects
     */
    this.router.get('/', this.controller.getAll);

    /**
     * @openapi
     * /api/products/{id}:
     *   get:
     *     tags: [Products]
     *     summary: Get a product by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Product object
     *       404:
     *         description: Product not found
     */
    this.router.get('/:id', this.controller.getById);
  }
}
