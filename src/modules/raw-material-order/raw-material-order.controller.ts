import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { RawMaterialOrderService } from "./raw-material-order.service";
import { RawMaterialOrderRepository } from "./raw-material-order.repository";

const service = new RawMaterialOrderService(new RawMaterialOrderRepository());

export class RawMaterialOrderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getOrdersForManufacturer(req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await service.createOrder(req.userId!, req.body);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.acceptOrder(req.params.id, req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async reportProblem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { description } = req.body;
      res.json(
        await service.reportProblem(req.params.id, req.userId!, description)
      );
    } catch (err) {
      next(err);
    }
  }
}
