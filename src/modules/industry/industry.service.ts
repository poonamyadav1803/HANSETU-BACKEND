import { BaseService } from "../../core/BaseService";
import { IndustryRepository } from "./industry.repository";

export class IndustryService extends BaseService {
  constructor(private repo: IndustryRepository) {
    super();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getBySlug(slug: string) {
    const industry = await this.repo.findBySlug(slug);
    if (!industry) this.throwNotFound("Industry not found");
    return industry!;
  }
}
