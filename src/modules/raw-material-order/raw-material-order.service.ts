import { HttpException } from "../../core/HttpException";
import { RawMaterialOrderRepository } from "./raw-material-order.repository";

export class RawMaterialOrderService {
  constructor(private repo: RawMaterialOrderRepository) {}

  async getOrdersForManufacturer(manufacturerUserId: string) {
    return this.repo.findByManufacturer(manufacturerUserId);
  }

  async createOrder(
    manufacturerUserId: string,
    data: {
      materialName: string;
      supplierName: string;
      quantity: string;
      price: string;
      city?: string;
      orderDate?: string;
    }
  ) {
    return this.repo.create({
      manufacturerUserId,
      materialName: data.materialName,
      supplierName: data.supplierName,
      quantity: data.quantity,
      price: data.price,
      city: data.city ?? null,
      orderDate: data.orderDate ?? new Date().toISOString().split("T")[0],
      status: "pending",
    });
  }

  async acceptOrder(orderId: string, manufacturerUserId: string) {
    const order = await this.repo.findById(orderId);
    if (!order) throw new HttpException(404, "Order not found.");
    if (order.manufacturerUserId !== manufacturerUserId)
      throw new HttpException(403, "Access denied.");
    return this.repo.updateStatus(orderId, "accepted");
  }

  async reportProblem(
    orderId: string,
    manufacturerUserId: string,
    description: string
  ) {
    const order = await this.repo.findById(orderId);
    if (!order) throw new HttpException(404, "Order not found.");
    if (order.manufacturerUserId !== manufacturerUserId)
      throw new HttpException(403, "Access denied.");
    return this.repo.updateStatus(orderId, "problem_reported", description);
  }
}
