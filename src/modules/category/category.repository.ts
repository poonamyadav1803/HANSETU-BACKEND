import { eq } from "drizzle-orm";
import { db } from "../../db";
import { categories, subcategories } from "../../db/schema";

export class CategoryRepository {
  async findAll() {
    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.name);

    // Attach subcategories to each category
    const subs = await db.select().from(subcategories);

    return cats.map((cat) => ({
      ...cat,
      subcategories: subs.filter((s) => s.categoryId === cat.id),
    }));
  }

  async findBySlug(slug: string) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    if (!cat) return null;

    const subs = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, cat.id));

    return { ...cat, subcategories: subs };
  }
}
