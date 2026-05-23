import {
  and, asc, desc, eq, gte, ilike, lte, or, sql,
} from "drizzle-orm";
import { db } from "../../db";
import {
  categories, industries, products, productServices,
  subcategories, users,
  calibrationServices, testingServices, trainingPrograms,
} from "../../db/schema";

export type ProductFilters = {
  industryId?: string;
  industrySlug?: string;
  categoryId?: string;
  subcategoryId?: string;
  manufacturerUserId?: string;
  materialType?: string;
  grade?: string;
  samplesAvailable?: boolean;
  inStock?: boolean;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export type ProductPayload = {
  manufacturerUserId?: string | null;
  industryId?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  materialType?: string | null;
  grade?: string | null;
  specifications?: Record<string, string> | null;
  moq?: number | null;
  leadTime?: string | null;
  price?: string | null;
  originalPrice?: string | null;
  brand?: string | null;
  samplesAvailable?: boolean;
  inStock?: boolean;
  rating?: string;
  reviews?: number;
};

export type ProductUpdatePayload = Partial<ProductPayload>;

export class ProductRepository {
  async findAll(filters: ProductFilters): Promise<{ data: unknown[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = this.buildConditions(filters);

    // Resolve industrySlug → industryId via a subquery condition
    let finalConditions = conditions;
    if (filters.industrySlug && !filters.industryId) {
      const [ind] = await db
        .select({ id: industries.id })
        .from(industries)
        .where(eq(industries.slug, filters.industrySlug));
      if (ind) {
        finalConditions = [...conditions, eq(products.industryId, ind.id)];
      }
    }

    const baseQuery = db
      .select({
        id: products.id,
        name: products.name,
        thumbnailUrl: products.thumbnailUrl,
        materialType: products.materialType,
        grade: products.grade,
        moq: products.moq,
        leadTime: products.leadTime,
        price: products.price,
        originalPrice: products.originalPrice,
        brand: products.brand,
        samplesAvailable: products.samplesAvailable,
        inStock: products.inStock,
        rating: products.rating,
        reviews: products.reviews,
        createdAt: products.createdAt,
        // joined
        industryId: industries.id,
        industrySlug: industries.slug,
        industryName: industries.name,
        categoryId: categories.id,
        categorySlug: categories.slug,
        categoryName: categories.name,
        subcategoryId: subcategories.id,
        subcategoryName: subcategories.name,
      })
      .from(products)
      .leftJoin(industries, eq(products.industryId, industries.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id));

    const rows = finalConditions.length > 0
      ? await baseQuery
          .where(and(...finalConditions))
          .orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset)
      : await baseQuery
          .orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset);

    // Count query (separate, cheaper)
    const countBase = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .leftJoin(industries, eq(products.industryId, industries.id));

    const [{ count }] = finalConditions.length > 0
      ? await countBase.where(and(...finalConditions))
      : await countBase;

    return {
      data: rows.map(this.shapeListRow),
      total: Number(count),
    };
  }

  async findById(id: string): Promise<unknown | null> {
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        thumbnailUrl: products.thumbnailUrl,
        materialType: products.materialType,
        grade: products.grade,
        specifications: products.specifications,
        moq: products.moq,
        leadTime: products.leadTime,
        price: products.price,
        originalPrice: products.originalPrice,
        brand: products.brand,
        samplesAvailable: products.samplesAvailable,
        inStock: products.inStock,
        rating: products.rating,
        reviews: products.reviews,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        manufacturerUserId: products.manufacturerUserId,
        // joined
        industryId: industries.id,
        industrySlug: industries.slug,
        industryName: industries.name,
        categoryId: categories.id,
        categorySlug: categories.slug,
        categoryName: categories.name,
        subcategoryId: subcategories.id,
        subcategoryName: subcategories.name,
      })
      .from(products)
      .leftJoin(industries, eq(products.industryId, industries.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
      .where(eq(products.id, id));

    if (!row) return null;

    // Optionally join manufacturer user info
    let manufacturer: Record<string, unknown> | null = null;
    if (row.manufacturerUserId) {
      const [u] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          businessType: users.businessType,
        })
        .from(users)
        .where(eq(users.id, row.manufacturerUserId));
      manufacturer = u ?? null;
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      thumbnailUrl: row.thumbnailUrl,
      materialType: row.materialType,
      grade: row.grade,
      specifications: row.specifications ?? {},
      moq: row.moq,
      leadTime: row.leadTime,
      price: row.price,
      originalPrice: row.originalPrice,
      brand: row.brand,
      samplesAvailable: row.samplesAvailable,
      inStock: row.inStock,
      rating: row.rating,
      reviews: row.reviews,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      industry: row.industryId
        ? { id: row.industryId, slug: row.industrySlug, name: row.industryName }
        : null,
      category: row.categoryId
        ? { id: row.categoryId, slug: row.categorySlug, name: row.categoryName }
        : null,
      subcategory: row.subcategoryId
        ? { id: row.subcategoryId, name: row.subcategoryName }
        : null,
      manufacturer,
    };
  }

  async findRelatedServices(productId: string) {
    const links = await db
      .select()
      .from(productServices)
      .where(eq(productServices.productId, productId));

    const testing: unknown[] = [];
    const calibration: unknown[] = [];
    const training: unknown[] = [];

    for (const link of links) {
      if (link.serviceType === "testing") {
        const [svc] = await db
          .select()
          .from(testingServices)
          .where(eq(testingServices.id, link.serviceId));
        if (svc) testing.push(svc);
      } else if (link.serviceType === "calibration") {
        const [svc] = await db
          .select()
          .from(calibrationServices)
          .where(eq(calibrationServices.id, link.serviceId));
        if (svc) calibration.push(svc);
      } else if (link.serviceType === "training") {
        const [svc] = await db
          .select()
          .from(trainingPrograms)
          .where(eq(trainingPrograms.id, link.serviceId));
        if (svc) training.push(svc);
      }
    }

    return { testing, calibration, training };
  }

  async findByManufacturer(manufacturerUserId: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.manufacturerUserId, manufacturerUserId))
      .orderBy(desc(products.createdAt));
  }

  async create(payload: ProductPayload) {
    const [created] = await db
      .insert(products)
      .values({
        ...payload,
        specifications: payload.specifications ?? {},
      } as any)
      .returning();
    return created;
  }

  async update(id: string, payload: ProductUpdatePayload) {
    const [updated] = await db
      .update(products)
      .set({
        ...payload,
        updatedAt: new Date(),
      } as any)
      .where(eq(products.id, id))
      .returning();
    return updated ?? null;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return deleted ?? null;
  }

  async rawFindById(id: string) {
    const [row] = await db.select().from(products).where(eq(products.id, id));
    return row ?? null;
  }

  async categoryExists(id: string): Promise<boolean> {
    const [row] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id));
    return Boolean(row);
  }

  async findSubcategory(id: string) {
    const [row] = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, id));
    return row ?? null;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private buildConditions(filters: ProductFilters) {
    const conds: ReturnType<typeof eq>[] = [];

    if (filters.industryId) {
      conds.push(eq(products.industryId, filters.industryId) as any);
    }
    if (filters.categoryId) {
      conds.push(eq(products.categoryId, filters.categoryId) as any);
    }
    if (filters.subcategoryId) {
      conds.push(eq(products.subcategoryId, filters.subcategoryId) as any);
    }
    if (filters.manufacturerUserId) {
      conds.push(eq(products.manufacturerUserId, filters.manufacturerUserId) as any);
    }
    if (filters.materialType) {
      conds.push(ilike(products.materialType, `%${filters.materialType}%`) as any);
    }
    if (filters.grade) {
      conds.push(ilike(products.grade, `%${filters.grade}%`) as any);
    }
    if (filters.brand) {
      conds.push(ilike(products.brand, `%${filters.brand}%`) as any);
    }
    if (filters.samplesAvailable !== undefined) {
      conds.push(eq(products.samplesAvailable, filters.samplesAvailable) as any);
    }
    if (filters.inStock !== undefined) {
      conds.push(eq(products.inStock, filters.inStock) as any);
    }
    if (filters.minPrice !== undefined) {
      conds.push(gte(products.price, String(filters.minPrice)) as any);
    }
    if (filters.maxPrice !== undefined) {
      conds.push(lte(products.price, String(filters.maxPrice)) as any);
    }
    if (filters.search) {
      const pat = `%${filters.search}%`;
      conds.push(
        or(
          ilike(products.name, pat),
          ilike(products.description, pat),
          ilike(products.materialType, pat),
          ilike(products.brand, pat)
        ) as any
      );
    }

    return conds;
  }

  private shapeListRow(row: Record<string, unknown>) {
    return {
      id: row.id,
      name: row.name,
      thumbnailUrl: row.thumbnailUrl,
      materialType: row.materialType,
      grade: row.grade,
      moq: row.moq,
      leadTime: row.leadTime,
      price: row.price,
      originalPrice: row.originalPrice,
      brand: row.brand,
      samplesAvailable: row.samplesAvailable,
      inStock: row.inStock,
      rating: row.rating,
      reviews: row.reviews,
      createdAt: row.createdAt,
      industry: row.industryId
        ? { id: row.industryId, slug: row.industrySlug, name: row.industryName }
        : null,
      category: row.categoryId
        ? { id: row.categoryId, slug: row.categorySlug, name: row.categoryName }
        : null,
      subcategory: row.subcategoryId
        ? { id: row.subcategoryId, name: row.subcategoryName }
        : null,
    };
  }
}
