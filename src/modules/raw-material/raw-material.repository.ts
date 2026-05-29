import { eq, and, asc } from "drizzle-orm";
import { db } from "../../db";
import { rawMaterials, rawMaterialProducts, type InsertRawMaterialProduct } from "../../db/schema";

export class RawMaterialRepository {
  async findAll(filters: { industrySlug?: string; category?: string }) {
    const conditions = [eq(rawMaterials.isActive, true)];

    if (filters.industrySlug) {
      conditions.push(eq(rawMaterials.industrySlug, filters.industrySlug));
    }
    if (filters.category) {
      conditions.push(eq(rawMaterials.category, filters.category));
    }

    return db
      .select()
      .from(rawMaterials)
      .where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(rawMaterials)
      .where(eq(rawMaterials.id, id));
    return row ?? null;
  }

  async findProducts(filters: { categorySlug?: string; subcategory?: string }) {
    const conditions = [eq(rawMaterialProducts.isActive, true)];

    if (filters.categorySlug) {
      conditions.push(eq(rawMaterialProducts.categorySlug, filters.categorySlug));
    }
    if (filters.subcategory) {
      conditions.push(eq(rawMaterialProducts.subcategory, filters.subcategory));
    }

    return db
      .select()
      .from(rawMaterialProducts)
      .where(and(...conditions))
      .orderBy(asc(rawMaterialProducts.name));
  }

  async findAllProductsAdmin(filters: { categorySlug?: string } = {}) {
    const conditions = filters.categorySlug
      ? [eq(rawMaterialProducts.categorySlug, filters.categorySlug)]
      : [];

    const query = db
      .select()
      .from(rawMaterialProducts)
      .orderBy(asc(rawMaterialProducts.categorySlug), asc(rawMaterialProducts.name));

    return conditions.length
      ? query.where(and(...conditions))
      : query;
  }

  async createProduct(data: InsertRawMaterialProduct) {
    const [created] = await db
      .insert(rawMaterialProducts)
      .values(data)
      .returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<InsertRawMaterialProduct>) {
    const [updated] = await db
      .update(rawMaterialProducts)
      .set(data)
      .where(eq(rawMaterialProducts.id, id))
      .returning();
    return updated ?? null;
  }

  async deleteProduct(id: string) {
    const [deleted] = await db
      .delete(rawMaterialProducts)
      .where(eq(rawMaterialProducts.id, id))
      .returning({ id: rawMaterialProducts.id });
    return deleted ?? null;
  }
}
