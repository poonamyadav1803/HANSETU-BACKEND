import { Request, Response, NextFunction } from "express";
import { SupplierService } from "./supplier.service";
import { SupplierRepository } from "./supplier.repository";
import { AuthRequest } from "../../middlewares/auth.middleware";

const service = new SupplierService(new SupplierRepository());

export class SupplierController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { industrySlug, materialCategory } = req.query;
      const filters: { industrySlug?: string; materialCategory?: string } = {};
      if (typeof industrySlug === "string") filters.industrySlug = industrySlug;
      if (typeof materialCategory === "string") filters.materialCategory = materialCategory;
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

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getDashboardStats(req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async adminSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, category, capability, location, certification, moqLte } = req.query;
      const results = await service.searchForAdmin({
        query: typeof query === "string" ? query : undefined,
        category: typeof category === "string" ? category : undefined,
        capability: typeof capability === "string" ? capability : undefined,
        location: typeof location === "string" ? location : undefined,
        certification: typeof certification === "string" ? certification : undefined,
        moqLte: typeof moqLte === "string" && moqLte.trim() ? Number(moqLte) : undefined,
      });
      res.json(results);
    } catch (err) {
      next(err);
    }
  }
}
