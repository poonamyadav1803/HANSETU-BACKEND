import { asc, eq } from 'drizzle-orm';
import { db } from '../../db';
import {
  categories,
  subcategories,
  type Category,
  type Subcategory,
} from '../../db/schema';

type SubcategoryWithCategory = Subcategory & {
  category: Pick<Category, 'id' | 'slug' | 'name'> | null;
};

type SubcategoryCreatePayload = {
  categoryId: string;
  name: string;
};

type SubcategoryUpdatePayload = Partial<SubcategoryCreatePayload>;

export class SubcategoryRepository {
  private async attachCategory(
    rows: Subcategory[],
  ): Promise<SubcategoryWithCategory[]> {
    if (rows.length === 0) return [];

    const categoryRows = await db.select().from(categories);

    return rows.map((subcategory) => {
      const category = categoryRows.find(
        (row) => row.id === subcategory.categoryId,
      );

      return {
        ...subcategory,
        category: category
          ? {
              id: category.id,
              slug: category.slug,
              name: category.name,
            }
          : null,
      };
    });
  }

  async findAll(filters: { categoryId?: string }) {
    const rows = filters.categoryId
      ? await db
          .select()
          .from(subcategories)
          .where(eq(subcategories.categoryId, filters.categoryId))
          .orderBy(asc(subcategories.name))
      : await db.select().from(subcategories).orderBy(asc(subcategories.name));

    return this.attachCategory(rows);
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, id));
    if (!row) return null;

    const [hydrated] = await this.attachCategory([row]);
    return hydrated ?? null;
  }

  async findPlainById(id: string) {
    const [row] = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, id));
    return row ?? null;
  }

  async findByCategoryAndName(categoryId: string, name: string) {
    const rows = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId));
    return (
      rows.find((row) => row.name.toLowerCase() === name.toLowerCase()) ?? null
    );
  }

  async create(payload: SubcategoryCreatePayload) {
    const [created] = await db
      .insert(subcategories)
      .values(payload as any)
      .returning();
    return this.findById(created.id);
  }

  async update(id: string, payload: SubcategoryUpdatePayload) {
    const [updated] = await db
      .update(subcategories)
      .set(payload as any)
      .where(eq(subcategories.id, id))
      .returning();

    if (!updated) return null;
    return this.findById(updated.id);
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(subcategories)
      .where(eq(subcategories.id, id))
      .returning({ id: subcategories.id });

    return deleted ?? null;
  }
}
