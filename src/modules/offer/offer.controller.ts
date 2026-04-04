import { Request, Response, NextFunction } from "express";
import { OfferService } from "./offer.service";
import { OfferRepository } from "./offer.repository";

const service = new OfferService(new OfferRepository());

export class OfferController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { isFeatured, category } = req.query;
      const filters: { isFeatured?: boolean; category?: string } = {};
      if (isFeatured === "true") filters.isFeatured = true;
      if (isFeatured === "false") filters.isFeatured = false;
      if (typeof category === "string") filters.category = category;
      res.json(await service.getAll(filters));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await service.getById(req.params.id));
    } catch (err) {
      next(err);
    }
  }
}
