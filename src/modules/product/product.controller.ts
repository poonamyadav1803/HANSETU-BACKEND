import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import { ProductRepository } from "./product.repository";

const service = new ProductService(new ProductRepository());

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, subcategoryId, inStock } = req.query;
      const filters: { categoryId?: string; subcategoryId?: string; inStock?: boolean } = {};

      if (typeof categoryId === "string") filters.categoryId = categoryId;
      if (typeof subcategoryId === "string") filters.subcategoryId = subcategoryId;
      if (inStock === "true") filters.inStock = true;
      if (inStock === "false") filters.inStock = false;

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
