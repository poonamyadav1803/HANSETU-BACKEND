import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { testingServices } from "../../db/schema";

export class TestingServiceRepository {
  async findAll(filters: { industrySlug?: string; category?: string }) {
    const conditions = [eq(testingServices.isActive, true)];
    if (filters.industrySlug) {
      conditions.push(eq(testingServices.industrySlug, filters.industrySlug));
    }
    if (filters.category) {
      conditions.push(eq(testingServices.category, filters.category));
    }
    return db.select().from(testingServices).where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(testingServices)
      .where(eq(testingServices.id, id));
    return row ?? null;
  }
}
