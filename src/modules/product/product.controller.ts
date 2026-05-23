import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ProductRepository } from "./product.repository";
import { createProductSchema, updateProductSchema } from "./product.schema";
import { ProductService } from "./product.service";

const service = new ProductService(new ProductRepository());

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, subcategoryId, manufacturerUserId, brand, inStock, search } =
        req.query;
      const filters = ProductController.buildListFilters({
        categoryId,
        subcategoryId,
        manufacturerUserId,
        brand,
        inStock,
        search,
      });

      res.json(await service.getAll(filters));
    } catch (err) {
      next(err);
    }
  }

  async getMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId, subcategoryId, brand, inStock, search } = req.query;
      const filters = ProductController.buildListFilters({
        categoryId,
        subcategoryId,
        brand,
        inStock,
        search,
      });

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

  private static buildListFilters(query: {
    categoryId?: unknown;
    subcategoryId?: unknown;
    manufacturerUserId?: unknown;
    brand?: unknown;
    inStock?: unknown;
    search?: unknown;
  }) {
    const filters: {
      categoryId?: string;
      subcategoryId?: string;
      manufacturerUserId?: string;
      brand?: string;
      inStock?: boolean;
      search?: string;
    } = {};

    if (typeof query.categoryId === "string") filters.categoryId = query.categoryId;
    if (typeof query.subcategoryId === "string") {
      filters.subcategoryId = query.subcategoryId;
    }
    if (typeof query.manufacturerUserId === "string") {
      filters.manufacturerUserId = query.manufacturerUserId;
    }
    if (typeof query.brand === "string") filters.brand = query.brand;
    if (query.inStock === "true") filters.inStock = true;
    if (query.inStock === "false") filters.inStock = false;
    if (typeof query.search === "string") filters.search = query.search;

    return filters;
  }

  private static getUploadedFiles(req: Request) {
    return Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];
  }

  private static normalizeProductBody(body: Record<string, unknown>) {
    const normalized = { ...body };

    for (const key of ["reviews", "images", "imageUrls", "specs"] as const) {
      if (typeof normalized[key] === "string") {
        normalized[key] = ProductController.parseMaybeJson(normalized[key]);
      }
    }

    if (typeof normalized.inStock === "string") {
      normalized.inStock = normalized.inStock === "true";
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

    if (typeof normalized.reviews === "string") {
      normalized.reviews = Number(normalized.reviews);
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
