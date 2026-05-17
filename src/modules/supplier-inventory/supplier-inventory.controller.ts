import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { SupplierInventoryService } from "./supplier-inventory.service";
import { SupplierInventoryRepository } from "./supplier-inventory.repository";

const service = new SupplierInventoryService(new SupplierInventoryRepository());

export class SupplierInventoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getInventory(req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await service.addItem(req.userId!, req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.updateItem(req.params.id, req.userId!, req.body));
    } catch (err) {
      next(err);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.deleteItem(req.params.id, req.userId!));
    } catch (err) {
      next(err);
    }
  }
}
