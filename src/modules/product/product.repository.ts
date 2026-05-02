import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { products } from '../../db/schema';

export class ProductRepository {
  async findAll(filters: {
    categoryId?: string;
    subcategoryId?: string;
    inStock?: boolean;
  }) {
    const conditions = [];

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters.subcategoryId) {
      conditions.push(eq(products.subcategoryId, filters.subcategoryId));
    }
    if (filters.inStock !== undefined) {
      conditions.push(eq(products.inStock, filters.inStock));
    }

    return conditions.length > 0
      ? db
          .select()
          .from(products)
          .where(and(...conditions))
      : db.select().from(products);
  }

  async findById(id: string) {
    const [row] = await db.select().from(products).where(eq(products.id, id));
    return row ?? null;
  }

  async findByCategoryId(categoryId: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));
  }
}
