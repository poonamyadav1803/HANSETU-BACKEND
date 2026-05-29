import { BaseService } from "../../core/BaseService";
import { MfrProductRepository } from "./mfr-product.repository";

export class MfrProductService extends BaseService {
  constructor(private repo: MfrProductRepository) {
    super();
  }

  getAll(filters: { industryId?: string; categoryId?: string }) {
    return this.repo.findAll(filters);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Product not found");
    return row!;
  }
}
