import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { SupplierTransactionService } from "./supplier-transaction.service";
import { SupplierTransactionRepository } from "./supplier-transaction.repository";

const service = new SupplierTransactionService(new SupplierTransactionRepository());

export class SupplierTransactionController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getTransactions(req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tx = await service.createTransaction(req.userId!, req.body);
      res.status(201).json(tx);
    } catch (err) {
      next(err);
    }
  }
}
