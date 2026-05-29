import { asc, eq } from "drizzle-orm";
import { db } from "../../db";
import { mfrIndustries } from "../../db/schema";

export class MfrIndustryRepository {
  findAll() {
    return db.select().from(mfrIndustries).orderBy(asc(mfrIndustries.sortOrder));
  }

  async findBySlug(slug: string) {
    const [row] = await db
      .select()
      .from(mfrIndustries)
      .where(eq(mfrIndustries.slug, slug));
    return row ?? null;
  }
}
