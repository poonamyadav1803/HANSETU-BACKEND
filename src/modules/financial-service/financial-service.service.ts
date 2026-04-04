import { BaseService } from "../../core/BaseService";
import { FinancialServiceRepository } from "./financial-service.repository";

export class FinancialServiceService extends BaseService {
  constructor(private repo: FinancialServiceRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string; category?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Financial service not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      features: row.features ? JSON.parse(row.features as string) : [],
    };
  }
}
