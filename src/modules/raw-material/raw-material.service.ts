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

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      specifications: row.specifications
        ? JSON.parse(row.specifications as string)
        : {},
    };
  }
}
