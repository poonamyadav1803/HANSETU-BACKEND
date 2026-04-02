import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { offers } from "../../db/schema";

export class OfferRepository {
  async findAll(filters: { isFeatured?: boolean; category?: string }) {
    const conditions = [eq(offers.isActive, true)];

    if (filters.isFeatured !== undefined) {
      conditions.push(eq(offers.isFeatured, filters.isFeatured));
    }
    if (filters.category) {
      conditions.push(eq(offers.category, filters.category));
    }

    return db
      .select()
      .from(offers)
      .where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(offers)
      .where(eq(offers.id, id));
    return row ?? null;
  }
}
