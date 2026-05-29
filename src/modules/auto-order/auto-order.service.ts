import { BaseService } from "../../core/BaseService";
import { AutoOrderRepository } from "./auto-order.repository";
import { InsertAutoOrder } from "../../db/schema";

export class AutoOrderService extends BaseService {
  constructor(private repo: AutoOrderRepository) {
    super();
  }

  getByUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  async getById(id: string, userId: string) {
    const row = await this.repo.findById(id, userId);
    if (!row) this.throwNotFound("Order not found");
    return row!;
  }

  create(userId: string, body: Omit<InsertAutoOrder, "userId" | "orderNumber">) {
    return this.repo.create({ ...body, userId } as InsertAutoOrder);
  }
}
