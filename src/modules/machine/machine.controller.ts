import { Request, Response, NextFunction } from "express";
import { MachineService } from "./machine.service";
import { MachineRepository } from "./machine.repository";

const service = new MachineService(new MachineRepository());

export class MachineController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, isFeatured } = req.query;
      const filters: { category?: string; isFeatured?: boolean } = {};
      if (typeof category === "string") filters.category = category;
      if (isFeatured === "true") filters.isFeatured = true;
      if (isFeatured === "false") filters.isFeatured = false;
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
