import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { calibrationServices } from "../../db/schema";

export class CalibrationServiceRepository {
  async findAll(filters: { industrySlug?: string }) {
    const conditions = [eq(calibrationServices.isActive, true)];
    if (filters.industrySlug) {
      conditions.push(eq(calibrationServices.industrySlug, filters.industrySlug));
    }
    return db.select().from(calibrationServices).where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(calibrationServices)
      .where(eq(calibrationServices.id, id));
    return row ?? null;
  }
}
