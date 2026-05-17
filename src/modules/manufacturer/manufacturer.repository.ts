import { and, eq, gte, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { manufacturers } from "../../db/schema";

export type ManufacturerFilters = {
  industrySlug?: string;
  city?: string;
  state?: string;
  inHouseTesting?: boolean;
  importExport?: boolean;
  certification?: string;
  machineCapability?: string;
  minRating?: string;
  search?: string;
};

export class ManufacturerRepository {
  async findAll(filters: ManufacturerFilters) {
    const conditions = [eq(manufacturers.isActive, true)];

    if (filters.industrySlug) {
      conditions.push(eq(manufacturers.industrySlug, filters.industrySlug));
    }
    if (filters.city) {
      conditions.push(ilike(manufacturers.city, `%${filters.city}%`));
    }
    if (filters.state) {
      conditions.push(ilike(manufacturers.state, `%${filters.state}%`));
    }
    if (filters.inHouseTesting !== undefined) {
      conditions.push(eq(manufacturers.inHouseTesting, filters.inHouseTesting));
    }
    if (filters.importExport !== undefined) {
      conditions.push(eq(manufacturers.importExport, filters.importExport));
    }
    if (filters.certification) {
      conditions.push(ilike(manufacturers.certifications, `%${filters.certification}%`));
    }
    if (filters.machineCapability) {
      conditions.push(ilike(manufacturers.machineCapabilities, `%${filters.machineCapability}%`));
    }
    if (filters.minRating) {
      conditions.push(gte(manufacturers.rating, filters.minRating));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(manufacturers.industrySlug, searchPattern),
          ilike(manufacturers.city, searchPattern),
          ilike(manufacturers.state, searchPattern),
          ilike(manufacturers.certifications, searchPattern),
          ilike(manufacturers.machineCapabilities, searchPattern)
        )!
      );
    }

    return db
      .select()
      .from(manufacturers)
      .where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(manufacturers)
      .where(eq(manufacturers.id, id));
    return row ?? null;
  }

  async countActive(): Promise<number> {
    const rows = await db
      .select({ id: manufacturers.id })
      .from(manufacturers)
      .where(eq(manufacturers.isActive, true));
    return rows.length;
  }
}
