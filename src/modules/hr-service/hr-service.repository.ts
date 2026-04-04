import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { hrServices } from "../../db/schema";

export class HrServiceRepository {
  async findAll(filters: { industrySlug?: string; category?: string }) {
    const conditions = [eq(hrServices.isActive, true)];
    if (filters.industrySlug) {
      conditions.push(eq(hrServices.industrySlug, filters.industrySlug));
    }
    if (filters.category) {
      conditions.push(eq(hrServices.category, filters.category));
    }
    return db.select().from(hrServices).where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(hrServices)
      .where(eq(hrServices.id, id));
    return row ?? null;
  }
}
