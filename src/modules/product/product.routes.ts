import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ProductController } from "./product.controller";

export class ProductRoutes {
  public router = Router();
  private controller = new ProductController();
  private uuidParam = ":id([0-9a-fA-F-]{36})";

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
     *       - in: query
     *         name: subcategoryId
     *         schema: { type: string, format: uuid }
     *       - in: query
     *         name: manufacturerUserId
     *         schema: { type: string, format: uuid }
     *       - in: query
     *         name: brand
     *         schema: { type: string }
     *       - in: query
     *         name: inStock
     *         schema: { type: boolean }
     *       - in: query
     *         name: search
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Array of product objects
     *   post:
     *     tags: [Products]
     *     summary: Create a product for the authenticated manufacturer
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       201:
     *         description: Product created
     *       403:
     *         description: Only manufacturer or admin users can create products
     */
    this.router.get("/", this.controller.getAll);
    this.router.post("/", authMiddleware, this.controller.create);

    /**
     * @openapi
     * /api/products/my-products:
     *   get:
     *     tags: [Products]
     *     summary: List products owned by the authenticated manufacturer
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Array of owned product objects
     */
    this.router.get("/my-products", authMiddleware, this.controller.getMine);

    /**
     * @openapi
     * /api/products/{id}:
     *   get:
     *     tags: [Products]
     *     summary: Get a product by ID
     *   patch:
     *     tags: [Products]
     *     summary: Update a product owned by the authenticated manufacturer
     *     security:
     *       - bearerAuth: []
     *   delete:
     *     tags: [Products]
     *     summary: Delete a product owned by the authenticated manufacturer
     *     security:
     *       - bearerAuth: []
     */
    this.router.get(`/${this.uuidParam}`, this.controller.getById);
    this.router.patch(`/${this.uuidParam}`, authMiddleware, this.controller.update);
    this.router.delete(`/${this.uuidParam}`, authMiddleware, this.controller.delete);
  }
}
