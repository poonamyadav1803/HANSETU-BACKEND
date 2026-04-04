import { BaseService } from "../../core/BaseService";
import { HrServiceRepository } from "./hr-service.repository";

export class HrServiceService extends BaseService {
  constructor(private repo: HrServiceRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string; category?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("HR service not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      skills: row.skills ? JSON.parse(row.skills as string) : [],
    };
  }
}
