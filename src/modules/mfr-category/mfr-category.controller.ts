import { Request, Response, NextFunction } from "express";
import { MfrCategoryService } from "./mfr-category.service";
import { MfrCategoryRepository } from "./mfr-category.repository";

const service = new MfrCategoryService(new MfrCategoryRepository());

export class MfrCategoryController {
  async getByIndustry(req: Request, res: Response, next: NextFunction) {
    try {
      const industryId = req.query.industryId as string;
      if (!industryId) {
        res.status(400).json({ message: "industryId query param required" });
        return;
      }
      res.json(await service.getByIndustry(industryId));
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
