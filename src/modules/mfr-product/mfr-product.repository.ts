import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db";
import { mfrProducts } from "../../db/schema";

export class MfrProductRepository {
  findAll(filters: { industryId?: string; categoryId?: string }) {
    const conditions = [eq(mfrProducts.isActive, true)];
    if (filters.industryId) conditions.push(eq(mfrProducts.industryId, filters.industryId));
    if (filters.categoryId) conditions.push(eq(mfrProducts.categoryId, filters.categoryId));
    return db
      .select()
      .from(mfrProducts)
      .where(and(...conditions))
      .orderBy(asc(mfrProducts.sortOrder));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(mfrProducts)
      .where(eq(mfrProducts.id, id));
    return row ?? null;
  }
}
