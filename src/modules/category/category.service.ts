import { BaseService } from "../../core/BaseService";
import { CategoryRepository } from "./category.repository";

export class CategoryService extends BaseService {
  constructor(private repo: CategoryRepository) {
    super();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getBySlug(slug: string) {
    const category = await this.repo.findBySlug(slug);
    if (!category) this.throwNotFound("Category not found");
    return category!;
  }
}
