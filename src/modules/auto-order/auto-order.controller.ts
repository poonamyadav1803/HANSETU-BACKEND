import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { AutoOrderService } from "./auto-order.service";
import { AutoOrderRepository } from "./auto-order.repository";

const service = new AutoOrderService(new AutoOrderRepository());

export class AutoOrderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getByUser(req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getById(req.params.id, req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await service.create(req.userId!, req.body);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }
}
