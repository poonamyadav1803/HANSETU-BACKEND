import { BaseService } from "../../core/BaseService";
import { ManufacturerRepository } from "./manufacturer.repository";

export class ManufacturerService extends BaseService {
  constructor(private repo: ManufacturerRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Manufacturer not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      certifications: row.certifications
        ? JSON.parse(row.certifications as string)
        : [],
      machineCapabilities: row.machineCapabilities
        ? JSON.parse(row.machineCapabilities as string)
        : [],
    };
  }
}
