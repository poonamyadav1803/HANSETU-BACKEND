import { asc, eq } from "drizzle-orm";
import { db } from "../../db";
import { industries, navRawMaterialCategories } from "../../db/schema";
import { HttpException } from "../../core/HttpException";

export interface NavRawMaterialInput {
  industryId?: string | null;
  label: string;
  slug: string;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface NavIndustryInput {
  slug: string;
  name: string;
  icon?: string | null;
}

export class NavService {
  async getRawMaterials() {
    const rows = await db
      .select({
        id: navRawMaterialCategories.id,
        label: navRawMaterialCategories.label,
        slug: navRawMaterialCategories.slug,
        icon: navRawMaterialCategories.icon,
        sortOrder: navRawMaterialCategories.sortOrder,
        isActive: navRawMaterialCategories.isActive,
        industryId: industries.id,
        industrySlug: industries.slug,
        industryName: industries.name,
      })
      .from(navRawMaterialCategories)
      .leftJoin(industries, eq(navRawMaterialCategories.industryId, industries.id))
      .where(eq(navRawMaterialCategories.isActive, true))
      .orderBy(asc(navRawMaterialCategories.sortOrder));

    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      slug: r.slug,
      icon: r.icon,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
      industry: r.industryId
        ? { id: r.industryId, slug: r.industrySlug, name: r.industryName }
        : null,
    }));
  }

  async createRawMaterial(input: NavRawMaterialInput) {
    const [created] = await db
      .insert(navRawMaterialCategories)
      .values({
        industryId: input.industryId ?? null,
        label: input.label,
        slug: input.slug,
        icon: input.icon ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      })
      .returning();
    return created;
  }

  async updateRawMaterial(id: string, input: Partial<NavRawMaterialInput>) {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (input.industryId !== undefined) set.industryId = input.industryId;
    if (input.label !== undefined) set.label = input.label;
    if (input.slug !== undefined) set.slug = input.slug;
    if (input.icon !== undefined) set.icon = input.icon;
    if (input.sortOrder !== undefined) set.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) set.isActive = input.isActive;

    const [updated] = await db
      .update(navRawMaterialCategories)
      .set(set as any)
      .where(eq(navRawMaterialCategories.id, id))
      .returning();

    if (!updated) throw new HttpException(404, "Nav item not found.");
    return updated;
  }

  async deleteRawMaterial(id: string) {
    const [deleted] = await db
      .delete(navRawMaterialCategories)
      .where(eq(navRawMaterialCategories.id, id))
      .returning({ id: navRawMaterialCategories.id });

    if (!deleted) throw new HttpException(404, "Nav item not found.");
    return { message: "Nav item deleted." };
  }

  async createIndustry(input: NavIndustryInput) {
    const [created] = await db
      .insert(industries)
      .values({ slug: input.slug, name: input.name, icon: input.icon ?? null })
      .returning();
    return created;
  }

  async deleteIndustry(id: string) {
    const [deleted] = await db
      .delete(industries)
      .where(eq(industries.id, id))
      .returning({ id: industries.id });

    if (!deleted) throw new HttpException(404, "Industry not found.");
    return { message: "Industry deleted." };
  }
}
