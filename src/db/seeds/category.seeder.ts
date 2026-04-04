/**
 * Category, Subcategory & Product Seeder
 *
 * Inserts all reference data from categoryData into the database.
 * Safe to run multiple times — uses upsert on slug/name conflict.
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  categories,
  subcategories,
  products,
  InsertCategory,
  InsertSubcategory,
  InsertProduct,
} from "../schema";
import { categoryData, colorSchemes } from "./category.data";
import { log } from "../../utils/logger";

export async function seedCategories(): Promise<void> {
  log("Seeding categories, subcategories, and products...");

  for (const [slug, data] of Object.entries(categoryData)) {
    const scheme = colorSchemes[slug as keyof typeof colorSchemes];
    const categoryName = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    // ── Upsert category ──────────────────────────────────────────────────────
    const categoryPayload: InsertCategory = {
      slug,
      name: categoryName,
      primaryColor: scheme?.primary ?? null,
      secondaryColor: scheme?.secondary ?? null,
      gradientColor: scheme?.gradient ?? null,
      badgeColor: scheme?.badge ?? null,
      isActive: true,
    };

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));

    let categoryId: string;

    if (existingCategory) {
      categoryId = existingCategory.id;
      log(`  Category already exists: ${slug}`);
    } else {
      const [inserted] = await db
        .insert(categories)
        .values(categoryPayload)
        .returning({ id: categories.id });
      categoryId = inserted.id;
      log(`  Created category: ${slug} (${categoryId})`);
    }

    // ── Upsert subcategories ─────────────────────────────────────────────────
    for (const subcategoryName of data.subcategories) {
      const [existing] = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.name, subcategoryName));

      if (existing) {
        continue;
      }

      const payload: InsertSubcategory = {
        categoryId,
        name: subcategoryName,
      };

      await db.insert(subcategories).values(payload);
    }

    log(`  Seeded ${data.subcategories.length} subcategories for: ${slug}`);

    // ── Upsert products ──────────────────────────────────────────────────────
    for (const product of data.products) {
      // Resolve subcategory id
      const [sub] = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.name, product.subcategory));

      const [existingProduct] = await db
        .select()
        .from(products)
        .where(eq(products.name, product.name));

      if (existingProduct) {
        continue;
      }

      const payload: InsertProduct = {
        categoryId,
        subcategoryId: sub?.id ?? null,
        name: product.name,
        price: String(product.price),
        originalPrice: product.originalPrice ? String(product.originalPrice) : null,
        rating: String(product.rating),
        reviews: product.reviews,
        brand: product.brand,
        inStock: product.inStock,
        specs: product.specs,
        description: product.description,
      };

      await db.insert(products).values(payload);
    }

    log(`  Seeded ${data.products.length} products for: ${slug}`);
  }

  log("Categories seeding complete.");
}
