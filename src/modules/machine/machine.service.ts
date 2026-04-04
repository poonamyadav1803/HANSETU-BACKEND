import { BaseService } from "../../core/BaseService";
import { MachineRepository } from "./machine.repository";

export class MachineService extends BaseService {
  constructor(private repo: MachineRepository) {
    super();
  }

  async getAll(filters: { category?: string; isFeatured?: boolean }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Machine not found");
    return this.parseJsonFields(row!);
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      specs: row.specs ? JSON.parse(row.specs as string) : {},
    };
  }
}
