import { Request, Response, NextFunction } from "express";
import { IndustryService } from "./industry.service";
import { IndustryRepository } from "./industry.repository";

const service = new IndustryService(new IndustryRepository());

export class IndustryController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getBySlug(req.params.slug);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}
