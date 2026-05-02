import { BaseService } from '../../core/BaseService';
import { CategoryRepository } from './category.repository';
import {
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './category.schema';

type CategoryPayload = {
  slug?: string;
  name?: string;
  description?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  gradientColor?: string | null;
  badgeColor?: string | null;
  isActive?: boolean;
};

export class CategoryService extends BaseService {
  constructor(private repo: CategoryRepository) {
    super();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: string) {
    const category = await this.repo.findById(id);
    if (!category) this.throwNotFound('Category not found');
    return category;
  }

  async getBySlug(slug: string) {
    const category = await this.repo.findBySlug(slug);
    if (!category) this.throwNotFound('Category not found');
    return category;
  }

  private normalizeSubcategories(subcategories?: string[]) {
    if (!subcategories) return undefined;

    return Array.from(
      new Set(subcategories.map((name) => name.trim()).filter(Boolean)),
    );
  }

  private toCategoryPayload(
    input: CreateCategoryInput | UpdateCategoryInput,
  ): CategoryPayload {
    const payload: CategoryPayload = {};

    if ('slug' in input && input.slug !== undefined)
      payload.slug = input.slug.trim();
    if ('name' in input && input.name !== undefined)
      payload.name = input.name.trim();
    if ('description' in input) payload.description = input.description ?? null;
    if ('primaryColor' in input)
      payload.primaryColor = input.primaryColor ?? null;
    if ('secondaryColor' in input)
      payload.secondaryColor = input.secondaryColor ?? null;
    if ('gradientColor' in input)
      payload.gradientColor = input.gradientColor ?? null;
    if ('badgeColor' in input) payload.badgeColor = input.badgeColor ?? null;
    if ('isActive' in input && input.isActive !== undefined)
      payload.isActive = input.isActive;

    return payload;
  }

  async create(input: CreateCategoryInput) {
    const existingCategory = await this.repo.findPlainBySlug(input.slug.trim());
    if (existingCategory) this.throwBadRequest('Category slug already exists');

    const categoryPayload = this.toCategoryPayload(input) as Required<
      Pick<CategoryPayload, 'slug' | 'name'>
    > &
      CategoryPayload;
    const subcategoryNames =
      this.normalizeSubcategories(input.subcategories) ?? [];

    return this.repo.create(categoryPayload, subcategoryNames);
  }

  async update(id: string, input: UpdateCategoryInput) {
    const existingCategory = await this.repo.findPlainById(id);
    if (!existingCategory) this.throwNotFound('Category not found');

    if (input.slug && input.slug.trim() !== existingCategory.slug) {
      const categoryWithSlug = await this.repo.findPlainBySlug(
        input.slug.trim(),
      );
      if (categoryWithSlug && categoryWithSlug.id !== id) {
        this.throwBadRequest('Category slug already exists');
      }
    }

    const categoryPayload = this.toCategoryPayload(input);
    const subcategoryNames = this.normalizeSubcategories(input.subcategories);

    const updatedCategory = await this.repo.update(
      id,
      categoryPayload,
      subcategoryNames,
    );
    if (!updatedCategory) this.throwNotFound('Category not found');
    return updatedCategory;
  }

  async delete(id: string) {
    const deletedCategory = await this.repo.delete(id);
    if (!deletedCategory) this.throwNotFound('Category not found');
  }
}
