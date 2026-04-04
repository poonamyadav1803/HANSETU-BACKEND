import { BaseService } from "../../core/BaseService";
import { TestingServiceRepository } from "./testing-service.repository";

export class TestingServiceService extends BaseService {
  constructor(private repo: TestingServiceRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string; category?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Testing service not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      certifications: row.certifications ? JSON.parse(row.certifications as string) : [],
      testTypes: row.testTypes ? JSON.parse(row.testTypes as string) : [],
    };
  }
}
