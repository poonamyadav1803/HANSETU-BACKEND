import { HttpException } from "../../core/HttpException";
import { SupplierInventoryRepository } from "./supplier-inventory.repository";

export class SupplierInventoryService {
  constructor(private repo: SupplierInventoryRepository) {}

  async getInventory(supplierUserId: string) {
    return this.repo.findBySupplier(supplierUserId);
  }

  async addItem(
    supplierUserId: string,
    data: { materialName: string; category: string; quantity: string; price: string; status?: string }
  ) {
    return this.repo.create({
      supplierUserId,
      materialName: data.materialName,
      category: data.category,
      quantity: data.quantity,
      price: data.price,
      status: (data.status as "available" | "low_stock" | "out_of_stock") ?? "available",
    });
  }

  async updateItem(
    id: string,
    supplierUserId: string,
    data: { materialName?: string; category?: string; quantity?: string; price?: string; status?: string }
  ) {
    const item = await this.repo.findById(id);
    if (!item) throw new HttpException(404, "Inventory item not found.");
    if (item.supplierUserId !== supplierUserId) throw new HttpException(403, "Access denied.");
    return this.repo.update(id, data);
  }

  async deleteItem(id: string, supplierUserId: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new HttpException(404, "Inventory item not found.");
    if (item.supplierUserId !== supplierUserId) throw new HttpException(403, "Access denied.");
    await this.repo.delete(id);
    return { message: "Item deleted." };
  }
}
