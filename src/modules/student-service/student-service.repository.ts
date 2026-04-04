import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { studentServices } from "../../db/schema";

export class StudentServiceRepository {
  async findAll(filters: { industrySlug?: string; category?: string }) {
    const conditions = [eq(studentServices.isActive, true)];
    if (filters.industrySlug) {
      conditions.push(eq(studentServices.industrySlug, filters.industrySlug));
    }
    if (filters.category) {
      conditions.push(eq(studentServices.category, filters.category));
    }
    return db.select().from(studentServices).where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(studentServices)
      .where(eq(studentServices.id, id));
    return row ?? null;
  }
}
