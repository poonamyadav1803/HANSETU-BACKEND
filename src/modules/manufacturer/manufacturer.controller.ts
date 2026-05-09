import { Request, Response, NextFunction } from "express";
import { ManufacturerService } from "./manufacturer.service";
import {
  ManufacturerFilters,
  ManufacturerRepository,
} from "./manufacturer.repository";

const service = new ManufacturerService(new ManufacturerRepository());

export class ManufacturerController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        industrySlug,
        city,
        state,
        inHouseTesting,
        importExport,
        certification,
        machineCapability,
        minRating,
        search,
      } = req.query;
      const filters: ManufacturerFilters = {};

      if (typeof industrySlug === "string") filters.industrySlug = industrySlug;
      if (typeof city === "string") filters.city = city;
      if (typeof state === "string") filters.state = state;
      if (inHouseTesting === "true") filters.inHouseTesting = true;
      if (inHouseTesting === "false") filters.inHouseTesting = false;
      if (importExport === "true") filters.importExport = true;
      if (importExport === "false") filters.importExport = false;
      if (typeof certification === "string") filters.certification = certification;
      if (typeof machineCapability === "string") filters.machineCapability = machineCapability;
      if (typeof minRating === "string") filters.minRating = minRating;
      if (typeof search === "string") filters.search = search;

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
