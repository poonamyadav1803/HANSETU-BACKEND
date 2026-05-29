import { asc, eq } from "drizzle-orm";
import { db } from "../../db";
import { mfrCategories } from "../../db/schema";

export class MfrCategoryRepository {
  findByIndustry(industryId: string) {
    return db
      .select()
      .from(mfrCategories)
      .where(eq(mfrCategories.industryId, industryId))
      .orderBy(asc(mfrCategories.sortOrder));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(mfrCategories)
      .where(eq(mfrCategories.id, id));
    return row ?? null;
  }
}
