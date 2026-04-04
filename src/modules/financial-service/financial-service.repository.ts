import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { financialServices } from "../../db/schema";

export class FinancialServiceRepository {
  async findAll(filters: { industrySlug?: string; category?: string }) {
    const conditions = [eq(financialServices.isActive, true)];
    if (filters.industrySlug) {
      conditions.push(eq(financialServices.industrySlug, filters.industrySlug));
    }
    if (filters.category) {
      conditions.push(eq(financialServices.category, filters.category));
    }
    return db.select().from(financialServices).where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(financialServices)
      .where(eq(financialServices.id, id));
    return row ?? null;
  }
}
