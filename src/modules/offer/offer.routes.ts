import { Router } from "express";
import { OfferController } from "./offer.controller";

export class OfferRoutes {
  public router = Router();
  private controller = new OfferController();

  constructor() {
    /**
     * @openapi
     * /api/offers:
     *   get:
     *     tags: [Offers]
     *     summary: List active offers with optional filters
     *     parameters:
     *       - in: query
     *         name: isFeatured
     *         schema: { type: boolean }
     *         description: Filter featured offers only
     *       - in: query
     *         name: category
     *         schema: { type: string }
     *         description: Filter by category (e.g. Tools, Raw Materials)
     *     responses:
     *       200:
     *         description: Array of offer objects
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/offers/{id}:
     *   get:
     *     tags: [Offers]
     *     summary: Get an offer by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string, format: uuid }
     *     responses:
     *       200:
     *         description: Offer object
     *       404:
     *         description: Not found
     */
    this.router.get("/:id", this.controller.getById);
  }
}
