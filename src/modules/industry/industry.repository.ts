import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { industries } from "../../db/schema";

export class IndustryRepository {
  async findAll() {
    return db
      .select()
      .from(industries)
      .where(eq(industries.isActive, true))
      .orderBy(industries.name);
  }

  async findBySlug(slug: string) {
    const [row] = await db
      .select()
      .from(industries)
      .where(eq(industries.slug, slug));
    return row ?? null;
  }
}
