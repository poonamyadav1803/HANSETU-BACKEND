import { Request, Response, NextFunction } from "express";
import { CategoryRepository } from "../category/category.repository";
import { SubcategoryRepository } from "./subcategory.repository";
import { SubcategoryService } from "./subcategory.service";
import {
  createSubcategorySchema,
  updateSubcategorySchema,
} from "./subcategory.schema";

const service = new SubcategoryService(
  new SubcategoryRepository(),
  new CategoryRepository()
);

export class SubcategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.query;
      const filters: { categoryId?: string } = {};

      if (typeof categoryId === "string") filters.categoryId = categoryId;

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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createSubcategorySchema.parse(req.body);
      const subcategory = await service.create(payload);
      res.status(201).json(subcategory);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateSubcategorySchema.parse(req.body);
      res.json(await service.update(req.params.id, payload));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await service.delete(req.params.id);
      res.json({ message: "Subcategory deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
