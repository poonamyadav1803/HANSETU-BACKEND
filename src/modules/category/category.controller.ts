import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";
import { CategoryRepository } from "./category.repository";

const service = new CategoryService(new CategoryRepository());

export class CategoryController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await service.getAll());
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await service.getBySlug(req.params.slug));
    } catch (err) {
      next(err);
    }
  }
}
