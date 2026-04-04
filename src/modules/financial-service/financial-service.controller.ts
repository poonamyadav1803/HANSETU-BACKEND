import { Request, Response, NextFunction } from "express";
import { FinancialServiceService } from "./financial-service.service";
import { FinancialServiceRepository } from "./financial-service.repository";

const service = new FinancialServiceService(new FinancialServiceRepository());

export class FinancialServiceController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { industrySlug, category } = req.query;
      const filters: { industrySlug?: string; category?: string } = {};
      if (typeof industrySlug === "string") filters.industrySlug = industrySlug;
      if (typeof category === "string") filters.category = category;
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
