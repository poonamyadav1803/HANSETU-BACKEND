import { BaseService } from "../../core/BaseService";
import { SupplierRepository } from "./supplier.repository";

export class SupplierService extends BaseService {
  constructor(private repo: SupplierRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string; materialCategory?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Supplier not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      materials: row.materials ? JSON.parse(row.materials as string) : [],
      certifications: row.certifications ? JSON.parse(row.certifications as string) : [],
    };
  }
}
