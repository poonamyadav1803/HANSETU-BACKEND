import { BaseService } from "../../core/BaseService";
import { TrainingProgramRepository } from "./training-program.repository";

export class TrainingProgramService extends BaseService {
  constructor(private repo: TrainingProgramRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string; category?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Training program not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      skills: row.skills ? JSON.parse(row.skills as string) : [],
    };
  }
}
