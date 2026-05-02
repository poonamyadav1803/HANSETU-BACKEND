import { asc, eq } from 'drizzle-orm';
import { db } from '../../db';
import {
  categories,
  subcategories,
  type Category,
  type Subcategory,
} from '../../db/schema';

type CategoryWithSubcategories = Category & { subcategories: Subcategory[] };
type CategoryCreatePayload = {
  slug: string;
  name: string;
  description?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  gradientColor?: string | null;
  badgeColor?: string | null;
  isActive?: boolean;
};
type CategoryUpdatePayload = Partial<CategoryCreatePayload>;
type SubcategoryCreatePayload = {
  categoryId: string;
  name: string;
};

export class CategoryRepository {
  private async attachSubcategories(
    cats: Category[],
  ): Promise<CategoryWithSubcategories[]> {
    if (cats.length === 0) return [];

    const subs = await db.select().from(subcategories);

    return cats.map((cat) => ({
      ...cat,
      subcategories: subs.filter(
        (subcategory) => subcategory.categoryId === cat.id,
      ),
    }));
  }

  async findAll() {
    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name));

    return this.attachSubcategories(cats);
  }

  async findById(id: string) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    if (!cat) return null;

    const [hydrated] = await this.attachSubcategories([cat]);
    return hydrated ?? null;
  }

  async findBySlug(slug: string) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    if (!cat) return null;

    const [hydrated] = await this.attachSubcategories([cat]);
    return hydrated ?? null;
  }

  async findPlainById(id: string) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return cat ?? null;
  }

  async findPlainBySlug(slug: string) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    return cat ?? null;
  }

  async create(
    categoryPayload: CategoryCreatePayload,
    subcategoryNames: string[] = [],
  ) {
    return db.transaction(async (tx) => {
      const [createdCategory] = await tx
        .insert(categories)
        .values(categoryPayload as any)
        .returning();

      if (subcategoryNames.length > 0) {
        const subcategoryPayload: SubcategoryCreatePayload[] =
          subcategoryNames.map((name) => ({
            categoryId: createdCategory.id,
            name,
          }));

        await tx.insert(subcategories).values(subcategoryPayload as any);
      }

      const createdSubcategories = await tx
        .select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, createdCategory.id));

      return {
        ...createdCategory,
        subcategories: createdSubcategories,
      };
    });
  }

  async update(
    id: string,
    categoryPayload: CategoryUpdatePayload,
    subcategoryNames?: string[],
  ) {
    return db.transaction(async (tx) => {
      const [updatedCategory] = await tx
        .update(categories)
        .set({
          ...categoryPayload,
          updatedAt: new Date(),
        } as any)
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory) return null;

      if (subcategoryNames) {
        await tx.delete(subcategories).where(eq(subcategories.categoryId, id));

        if (subcategoryNames.length > 0) {
          const subcategoryPayload: SubcategoryCreatePayload[] =
            subcategoryNames.map((name) => ({
              categoryId: id,
              name,
            }));

          await tx.insert(subcategories).values(subcategoryPayload as any);
        }
      }

      const updatedSubcategories = await tx
        .select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, id));

      return {
        ...updatedCategory,
        subcategories: updatedSubcategories,
      };
    });
  }

  async delete(id: string) {
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    return deletedCategory ?? null;
  }
}
