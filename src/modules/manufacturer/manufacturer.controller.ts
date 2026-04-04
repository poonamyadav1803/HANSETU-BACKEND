import { Request, Response, NextFunction } from "express";
import { ManufacturerService } from "./manufacturer.service";
import { ManufacturerRepository } from "./manufacturer.repository";

const service = new ManufacturerService(new ManufacturerRepository());

export class ManufacturerController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { industrySlug } = req.query;
      const filters: { industrySlug?: string } = {};
      if (typeof industrySlug === "string") filters.industrySlug = industrySlug;
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
