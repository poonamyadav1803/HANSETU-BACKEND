import { Request, Response, NextFunction } from "express";
import { CalibrationServiceService } from "./calibration-service.service";
import { CalibrationServiceRepository } from "./calibration-service.repository";

const service = new CalibrationServiceService(new CalibrationServiceRepository());

export class CalibrationServiceController {
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
