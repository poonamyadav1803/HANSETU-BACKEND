import { Request, Response, NextFunction } from "express";
import { SupplierService } from "./supplier.service";
import { SupplierRepository } from "./supplier.repository";

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
}
