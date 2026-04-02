import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { rawMaterials } from "../../db/schema";

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
}
