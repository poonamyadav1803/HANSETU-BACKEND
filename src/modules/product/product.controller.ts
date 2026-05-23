import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ProductRepository } from "./product.repository";
import { createProductSchema, updateProductSchema } from "./product.schema";
import { ProductService } from "./product.service";
import { ProductFilters } from "./product.repository";

const service = new ProductService(new ProductRepository());

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = ProductController.parseListFilters(req.query);
      res.json(await service.getAll(filters));
    } catch (err) {
      next(err);
    }
  }

  async getMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getMine({ userId: req.userId, userRole: req.userRole }, {}));
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

  async getRelatedServices(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await service.getRelatedServices(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload = createProductSchema.parse(req.body);
      const product = await service.create(payload, {
        userId: req.userId,
        userRole: req.userRole,
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload = updateProductSchema.parse(req.body);
      res.json(
        await service.update(req.params.id, payload, {
          userId: req.userId,
          userRole: req.userRole,
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await service.delete(req.params.id, {
        userId: req.userId,
        userRole: req.userRole,
      });
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  private static parseListFilters(query: Record<string, unknown>): ProductFilters {
    const f: ProductFilters = {};

    if (typeof query.industryId === "string") f.industryId = query.industryId;
    if (typeof query.industrySlug === "string") f.industrySlug = query.industrySlug;
    if (typeof query.categoryId === "string") f.categoryId = query.categoryId;
    if (typeof query.subcategoryId === "string") f.subcategoryId = query.subcategoryId;
    if (typeof query.manufacturerUserId === "string") f.manufacturerUserId = query.manufacturerUserId;
    if (typeof query.materialType === "string") f.materialType = query.materialType;
    if (typeof query.grade === "string") f.grade = query.grade;
    if (typeof query.brand === "string") f.brand = query.brand;
    if (typeof query.search === "string") f.search = query.search;
    if (query.samplesAvailable === "true") f.samplesAvailable = true;
    if (query.samplesAvailable === "false") f.samplesAvailable = false;
    if (query.inStock === "true") f.inStock = true;
    if (query.inStock === "false") f.inStock = false;
    if (typeof query.minPrice === "string") f.minPrice = parseFloat(query.minPrice);
    if (typeof query.maxPrice === "string") f.maxPrice = parseFloat(query.maxPrice);
    if (typeof query.page === "string") f.page = Math.max(1, parseInt(query.page, 10));
    if (typeof query.limit === "string") f.limit = Math.min(100, Math.max(1, parseInt(query.limit, 10)));

    return f;
  }
}
