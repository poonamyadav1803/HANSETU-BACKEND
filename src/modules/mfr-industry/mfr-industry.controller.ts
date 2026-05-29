import { Request, Response, NextFunction } from "express";
import { MfrIndustryService } from "./mfr-industry.service";
import { MfrIndustryRepository } from "./mfr-industry.repository";

const service = new MfrIndustryService(new MfrIndustryRepository());

export class MfrIndustryController {
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
