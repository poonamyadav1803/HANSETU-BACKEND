import { BaseService } from "../../core/BaseService";
import { MfrCategoryRepository } from "./mfr-category.repository";

export class MfrCategoryService extends BaseService {
  constructor(private repo: MfrCategoryRepository) {
    super();
  }

  getByIndustry(industryId: string) {
    return this.repo.findByIndustry(industryId);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Category not found");
    return row!;
  }
}
