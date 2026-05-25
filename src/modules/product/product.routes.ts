import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createImageUpload } from "../../middlewares/upload.middleware";
import { ProductController } from "./product.controller";

export class ProductRoutes {
  public router = Router();
  private controller = new ProductController();
  private uuidParam = ":id([0-9a-fA-F-]{36})";
  private productImagesUpload = createImageUpload({
    fieldName: "images",
    maxFiles: 10,
    maxFileSizeMb: 5,
  });

  constructor() {
    /**
     * @openapi
     * /api/products:
     *   get:
     *     tags: [Products]
     *     summary: List products with optional filters and pagination
     *   post:
     *     tags: [Products]
     *     summary: Create a product (manufacturer or admin)
     *     security:
     *       - bearerAuth: []
     */
    this.router.get("/", this.controller.getAll.bind(this.controller));
    this.router.post(
      "/",
      authMiddleware,
      this.productImagesUpload,
      this.controller.create.bind(this.controller)
    );

    /**
     * @openapi
     * /api/products/my-products:
     *   get:
     *     tags: [Products]
     *     summary: List products owned by the authenticated manufacturer
     *     security:
     *       - bearerAuth: []
     */
    this.router.get(
      "/my-products",
      authMiddleware,
      this.controller.getMine.bind(this.controller)
    );

    /**
     * @openapi
     * /api/products/{id}/related-services:
     *   get:
     *     tags: [Products]
     *     summary: Get testing, calibration, and training services linked to this product
     */
    this.router.get(
      `/${this.uuidParam}/related-services`,
      this.controller.getRelatedServices.bind(this.controller)
    );

    /**
     * @openapi
     * /api/products/{id}:
     *   get:
     *     tags: [Products]
     *     summary: Get full product detail by ID
     *   patch:
     *     tags: [Products]
     *     summary: Update a product
     *     security:
     *       - bearerAuth: []
     *   delete:
     *     tags: [Products]
     *     summary: Delete a product
     *     security:
     *       - bearerAuth: []
     */
    this.router.get(`/${this.uuidParam}`, this.controller.getById.bind(this.controller));
    this.router.patch(
      `/${this.uuidParam}`,
      authMiddleware,
      this.productImagesUpload,
      this.controller.update.bind(this.controller)
    );
    this.router.delete(
      `/${this.uuidParam}`,
      authMiddleware,
      this.controller.delete.bind(this.controller)
    );
  }
}
