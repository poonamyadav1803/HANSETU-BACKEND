import { BaseService } from "../../core/BaseService";
import { RawMaterialRepository } from "./raw-material.repository";

export class RawMaterialService extends BaseService {
  constructor(private repo: RawMaterialRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string; category?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Raw material not found");
    return this.parseJsonFields(row!);
  }

  async getProducts(filters: { categorySlug?: string; subcategory?: string }) {
    return this.repo.findProducts(filters);
  }

  async getAllProductsAdmin(filters: { categorySlug?: string } = {}) {
    return this.repo.findAllProductsAdmin(filters);
  }

  async createProduct(data: Parameters<RawMaterialRepository["createProduct"]>[0]) {
    return this.repo.createProduct(data);
  }

  async updateProduct(id: string, data: Parameters<RawMaterialRepository["updateProduct"]>[1]) {
    const updated = await this.repo.updateProduct(id, data);
    if (!updated) this.throwNotFound("Product not found");
    return updated!;
  }

  async deleteProduct(id: string) {
    const deleted = await this.repo.deleteProduct(id);
    if (!deleted) this.throwNotFound("Product not found");
    return { message: "Product deleted." };
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      specifications: row.specifications
        ? JSON.parse(row.specifications as string)
        : {},
    };
  }
}
