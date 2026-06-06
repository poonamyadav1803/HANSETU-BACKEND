import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
import {
  confirmOrderSchema,
  listOrdersQuerySchema,
  recordAdvancePaymentSchema,
  updatePhase5DocumentsSchema,
} from "./order.schema";

const service = new OrderService(new OrderRepository());

export class OrderController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = listOrdersQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      res.json(await service.listBuyerOrders(req.userId!, parsed.data));
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = confirmOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      const order = await service.confirmOrder(req.userId!, parsed.data);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getBuyerOrder(req.params.id, req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async recordAdvancePayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = recordAdvancePaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      res.json(await service.recordAdvancePayment(req.params.id, req.userId!, parsed.data));
    } catch (err) {
      next(err);
    }
  }

  async adminList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = listOrdersQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      res.json(await service.listAdminOrders(parsed.data));
    } catch (err) {
      next(err);
    }
  }

  async adminGetOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getAdminOrder(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  async adminUpdatePhase5Documents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = updatePhase5DocumentsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      res.json(await service.updatePhase5Documents(req.params.id, parsed.data));
    } catch (err) {
      next(err);
    }
  }
}
