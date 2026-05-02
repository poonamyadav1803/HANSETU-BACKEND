import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { createCategorySchema, updateCategorySchema } from './category.schema';

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

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await service.getById(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createCategorySchema.parse(req.body);
      const category = await service.create(payload);
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateCategorySchema.parse(req.body);
      res.json(await service.update(req.params.id, payload));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await service.delete(req.params.id);
      res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
