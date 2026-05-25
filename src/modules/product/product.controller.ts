import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ProductFilters, ProductRepository } from "./product.repository";
import { createProductSchema, updateProductSchema } from "./product.schema";
import { ProductService } from "./product.service";

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
      const filters = ProductController.parseListFilters(req.query);
      res.json(
        await service.getMine(
          { userId: req.userId, userRole: req.userRole },
          filters
        )
      );
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
      const payload = createProductSchema.parse(
        ProductController.normalizeProductBody(req.body)
      );
      const product = await service.create(
        payload,
        {
          userId: req.userId,
          userRole: req.userRole,
        },
        ProductController.getUploadedFiles(req)
      );
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload = updateProductSchema.parse(
        ProductController.normalizeProductBody(req.body)
      );
      res.json(
        await service.update(
          req.params.id,
          payload,
          {
            userId: req.userId,
            userRole: req.userRole,
          },
          ProductController.getUploadedFiles(req)
        )
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
    const filters: ProductFilters = {};

    if (typeof query.industryId === "string") filters.industryId = query.industryId;
    if (typeof query.industrySlug === "string") filters.industrySlug = query.industrySlug;
    if (typeof query.categoryId === "string") filters.categoryId = query.categoryId;
    if (typeof query.subcategoryId === "string") filters.subcategoryId = query.subcategoryId;
    if (typeof query.manufacturerUserId === "string") {
      filters.manufacturerUserId = query.manufacturerUserId;
    }
    if (typeof query.materialType === "string") filters.materialType = query.materialType;
    if (typeof query.grade === "string") filters.grade = query.grade;
    if (typeof query.brand === "string") filters.brand = query.brand;
    if (typeof query.search === "string") filters.search = query.search;
    if (query.samplesAvailable === "true") filters.samplesAvailable = true;
    if (query.samplesAvailable === "false") filters.samplesAvailable = false;
    if (query.inStock === "true") filters.inStock = true;
    if (query.inStock === "false") filters.inStock = false;
    if (typeof query.minPrice === "string") filters.minPrice = parseFloat(query.minPrice);
    if (typeof query.maxPrice === "string") filters.maxPrice = parseFloat(query.maxPrice);
    if (typeof query.page === "string") {
      filters.page = Math.max(1, parseInt(query.page, 10));
    }
    if (typeof query.limit === "string") {
      filters.limit = Math.min(100, Math.max(1, parseInt(query.limit, 10)));
    }

    return filters;
  }

  private static getUploadedFiles(req: Request) {
    return Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];
  }

  private static normalizeProductBody(body: Record<string, unknown>) {
    const normalized = { ...body };

    for (const key of ["images", "imageUrls", "specifications"] as const) {
      if (typeof normalized[key] === "string") {
        normalized[key] = ProductController.parseMaybeJson(normalized[key]);
      }
    }

    for (const key of ["samplesAvailable", "inStock"] as const) {
      if (typeof normalized[key] === "string") {
        normalized[key] = normalized[key] === "true";
      }
    }

    for (const key of ["moq", "reviews"] as const) {
      if (typeof normalized[key] === "string") {
        normalized[key] = Number(normalized[key]);
      }
    }

    if (typeof normalized.imageUrls === "string") {
      normalized.imageUrls = [normalized.imageUrls];
    }

    if (Array.isArray(normalized.imageUrls)) {
      normalized.imageUrls = normalized.imageUrls.flatMap((value) =>
        typeof value === "string"
          ? value.split(",").map((url) => url.trim()).filter(Boolean)
          : value
      );
    }

    return normalized;
  }

  private static parseMaybeJson(value: unknown) {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
