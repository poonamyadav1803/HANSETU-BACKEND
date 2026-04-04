import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { trainingPrograms } from "../../db/schema";

export class TrainingProgramRepository {
  async findAll(filters: { industrySlug?: string; category?: string }) {
    const conditions = [eq(trainingPrograms.isActive, true)];
    if (filters.industrySlug) {
      conditions.push(eq(trainingPrograms.industrySlug, filters.industrySlug));
    }
    if (filters.category) {
      conditions.push(eq(trainingPrograms.category, filters.category));
    }
    return db.select().from(trainingPrograms).where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(trainingPrograms)
      .where(eq(trainingPrograms.id, id));
    return row ?? null;
  }
}
