import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { manufacturers } from "../../db/schema";

export class ManufacturerRepository {
  async findAll(filters: { industrySlug?: string }) {
    const conditions = [eq(manufacturers.isActive, true)];

    if (filters.industrySlug) {
      conditions.push(eq(manufacturers.industrySlug, filters.industrySlug));
    }

    return db
      .select()
      .from(manufacturers)
      .where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(manufacturers)
      .where(eq(manufacturers.id, id));
    return row ?? null;
  }
}
