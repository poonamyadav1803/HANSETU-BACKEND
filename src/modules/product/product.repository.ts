import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { categories, products, subcategories } from "../../db/schema";

export type ProductFilters = {
  categoryId?: string;
  subcategoryId?: string;
  manufacturerUserId?: string;
  brand?: string;
  inStock?: boolean;
  search?: string;
};

export type ProductPayload = {
  manufacturerUserId?: string | null;
  categoryId: string;
  subcategoryId?: string | null;
  name: string;
  price: string;
  originalPrice?: string | null;
  rating?: string;
  reviews?: number;
  brand?: string | null;
  inStock?: boolean;
  specs?: string | null;
  description?: string | null;
};

export type ProductUpdatePayload = Partial<ProductPayload>;

export class ProductRepository {
  async findAll(filters: ProductFilters) {
    const conditions = [];

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters.subcategoryId) {
      conditions.push(eq(products.subcategoryId, filters.subcategoryId));
    }
    if (filters.manufacturerUserId) {
      conditions.push(eq(products.manufacturerUserId, filters.manufacturerUserId));
    }
    if (filters.brand) {
      conditions.push(ilike(products.brand, `%${filters.brand}%`));
    }
    if (filters.inStock !== undefined) {
      conditions.push(eq(products.inStock, filters.inStock));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(products.name, searchPattern),
          ilike(products.brand, searchPattern),
          ilike(products.description, searchPattern)
        )!
      );
    }

    return conditions.length > 0
      ? db
          .select()
          .from(products)
          .where(and(...conditions))
          .orderBy(desc(products.createdAt))
      : db.select().from(products).orderBy(desc(products.createdAt));
  }

  async findById(id: string) {
    const [row] = await db.select().from(products).where(eq(products.id, id));
    return row ?? null;
  }

  async findByCategoryId(categoryId: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));
  }

  async create(payload: ProductPayload) {
    const [created] = await db
      .insert(products)
      .values(payload as any)
      .returning();
    return created;
  }

  async update(id: string, payload: ProductUpdatePayload) {
    const [updated] = await db
      .update(products)
      .set({
        ...payload,
        updatedAt: new Date(),
      } as any)
      .where(eq(products.id, id))
      .returning();

    return updated ?? null;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return deleted ?? null;
  }

  async categoryExists(id: string) {
    const [row] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id));
    return Boolean(row);
  }

  async findSubcategory(id: string) {
    const [row] = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, id));
    return row ?? null;
  }
}
