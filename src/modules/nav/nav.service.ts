import { asc, eq } from "drizzle-orm";
import { db } from "../../db";
import { industries, navRawMaterialCategories } from "../../db/schema";
import { HttpException } from "../../core/HttpException";

export interface NavRawMaterialInput {
  slug: string;
  name: string;
  icon?: string | null;
  groupName: string;
  subcategories?: string[];
  isActive?: boolean;
}

export interface NavIndustryInput {
  slug: string;
  name: string;
  icon?: string | null;
}

export class NavService {
  async getRawMaterials() {
    return db
      .select()
      .from(navRawMaterialCategories)
      .where(eq(navRawMaterialCategories.isActive, true))
      .orderBy(asc(navRawMaterialCategories.groupName), asc(navRawMaterialCategories.name));
  }

  async createRawMaterial(input: NavRawMaterialInput) {
    const [created] = await db
      .insert(navRawMaterialCategories)
      .values({
        slug: input.slug,
        name: input.name,
        icon: input.icon ?? null,
        groupName: input.groupName,
        subcategories: input.subcategories ?? [],
        isActive: input.isActive ?? true,
      })
      .returning();

    return created;
  }

  async updateRawMaterial(id: string, input: Partial<NavRawMaterialInput>) {
    const [updated] = await db
      .update(navRawMaterialCategories)
      .set({
        slug: input.slug,
        name: input.name,
        icon: input.icon,
        groupName: input.groupName,
        subcategories: input.subcategories,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(navRawMaterialCategories.id, id))
      .returning();

    if (!updated) throw new HttpException(404, "Raw material category not found.");
    return updated;
  }

  async deleteRawMaterial(id: string) {
    const [deleted] = await db
      .delete(navRawMaterialCategories)
      .where(eq(navRawMaterialCategories.id, id))
      .returning({ id: navRawMaterialCategories.id });

    if (!deleted) throw new HttpException(404, "Raw material category not found.");
    return { message: "Raw material category deleted successfully." };
  }

  async createIndustry(input: NavIndustryInput) {
    const [created] = await db
      .insert(industries)
      .values({
        slug: input.slug,
        name: input.name,
        icon: input.icon ?? null,
      })
      .returning();

    return created;
  }

  async deleteIndustry(id: string) {
    const [deleted] = await db
      .delete(industries)
      .where(eq(industries.id, id))
      .returning({ id: industries.id });

    if (!deleted) throw new HttpException(404, "Industry not found.");
    return { message: "Industry deleted successfully." };
  }
}
