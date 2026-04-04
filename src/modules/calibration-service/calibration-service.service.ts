import { BaseService } from "../../core/BaseService";
import { CalibrationServiceRepository } from "./calibration-service.repository";

export class CalibrationServiceService extends BaseService {
  constructor(private repo: CalibrationServiceRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Calibration service not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      instruments: row.instruments ? JSON.parse(row.instruments as string) : [],
    };
  }
}
