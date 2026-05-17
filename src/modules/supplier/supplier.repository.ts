import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { suppliers } from "../../db/schema";

export class SupplierRepository {
  async findAll(filters: { industrySlug?: string; materialCategory?: string }) {
    const conditions = [eq(suppliers.isActive, true)];
    if (filters.industrySlug) {
      conditions.push(eq(suppliers.industrySlug, filters.industrySlug));
    }
    if (filters.materialCategory) {
      conditions.push(eq(suppliers.materialCategory, filters.materialCategory));
    }
    return db.select().from(suppliers).where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return row ?? null;
  }

  async countActive(): Promise<number> {
    const rows = await db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.isActive, true));
    return rows.length;
  }
}
