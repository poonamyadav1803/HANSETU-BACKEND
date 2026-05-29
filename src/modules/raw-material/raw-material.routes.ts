import { Router } from "express";
import { RawMaterialController } from "./raw-material.controller";

export class RawMaterialRoutes {
  public router = Router();
  private controller = new RawMaterialController();

  constructor() {
    /**
     * @openapi
     * /api/raw-materials:
     *   get:
     *     tags: [Raw Materials]
     *     summary: List raw materials with optional filters
     *     parameters:
     *       - in: query
     *         name: industrySlug
     *         schema: { type: string }
     *         description: Filter by industry slug (e.g. aerospace, automobile)
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by material category (e.g. Aluminum, Steel)
     *     responses:
     *       200:
     *         description: Array of raw material objects (specifications is a parsed object)
     */
    this.router.get("/", this.controller.getAll);

    // Material-category-based catalogue (new flow)
    this.router.get("/products", this.controller.getProducts);
    this.router.post("/inquiries", this.controller.createInquiry);

    this.router.get("/:id", this.controller.getById);
  }
}
