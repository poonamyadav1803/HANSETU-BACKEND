import { BaseService } from "../../core/BaseService";
import { MfrIndustryRepository } from "./mfr-industry.repository";

export class MfrIndustryService extends BaseService {
  constructor(private repo: MfrIndustryRepository) {
    super();
  }

  getAll() {
    return this.repo.findAll();
  }

  async getBySlug(slug: string) {
    const row = await this.repo.findBySlug(slug);
    if (!row) this.throwNotFound("Industry not found");
    return row!;
  }
}
