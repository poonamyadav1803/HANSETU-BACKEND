import { BaseService } from '../../core/BaseService';
import { CategoryRepository } from '../category/category.repository';
import { SubcategoryRepository } from './subcategory.repository';
import {
  type CreateSubcategoryInput,
  type UpdateSubcategoryInput,
} from './subcategory.schema';

type SubcategoryPayload = {
  categoryId?: string;
  name?: string;
};

export class SubcategoryService extends BaseService {
  constructor(
    private repo: SubcategoryRepository,
    private categoryRepo: CategoryRepository,
  ) {
    super();
  }

  async getAll(filters: { categoryId?: string }) {
    return this.repo.findAll(filters);
  }

  async getById(id: string) {
    const subcategory = await this.repo.findById(id);
    if (!subcategory) this.throwNotFound('Subcategory not found');
    return subcategory;
  }

  private normalizeName(name?: string) {
    return name?.trim();
  }

  private toPayload(
    input: CreateSubcategoryInput | UpdateSubcategoryInput,
  ): SubcategoryPayload {
    const payload: SubcategoryPayload = {};

    if ('categoryId' in input && input.categoryId !== undefined) {
      payload.categoryId = input.categoryId;
    }
    if ('name' in input && input.name !== undefined) {
      payload.name = this.normalizeName(input.name);
    }

    return payload;
  }

  async create(input: CreateSubcategoryInput) {
    const category = await this.categoryRepo.findPlainById(input.categoryId);
    if (!category) this.throwBadRequest('Category not found');

    const existing = await this.repo.findByCategoryAndName(
      input.categoryId,
      input.name.trim(),
    );
    if (existing)
      this.throwBadRequest('Subcategory name already exists for this category');

    const created = await this.repo.create(
      this.toPayload(input) as Required<SubcategoryPayload>,
    );
    if (!created) this.throwBadRequest('Failed to create subcategory');
    return created;
  }

  async update(id: string, input: UpdateSubcategoryInput) {
    const existing = await this.repo.findPlainById(id);
    if (!existing) this.throwNotFound('Subcategory not found');

    const nextCategoryId = input.categoryId ?? existing.categoryId;
    const nextName = this.normalizeName(input.name) ?? existing.name;

    if (input.categoryId) {
      const category = await this.categoryRepo.findPlainById(input.categoryId);
      if (!category) this.throwBadRequest('Category not found');
    }

    const duplicate = await this.repo.findByCategoryAndName(
      nextCategoryId,
      nextName,
    );
    if (duplicate && duplicate.id !== id) {
      this.throwBadRequest('Subcategory name already exists for this category');
    }

    const updated = await this.repo.update(id, this.toPayload(input));
    if (!updated) this.throwNotFound('Subcategory not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) this.throwNotFound('Subcategory not found');
  }
}
