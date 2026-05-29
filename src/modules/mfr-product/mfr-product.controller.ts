import { Request, Response, NextFunction } from "express";
import { MfrProductService } from "./mfr-product.service";
import { MfrProductRepository } from "./mfr-product.repository";

const service = new MfrProductService(new MfrProductRepository());

export class MfrProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { industryId, categoryId } = req.query as Record<string, string>;
      res.json(await service.getAll({ industryId, categoryId }));
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
