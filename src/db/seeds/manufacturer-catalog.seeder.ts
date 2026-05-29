/**
 * Manufacturer Catalog Seeder
 * Seeds mfr_industries, mfr_categories, mfr_products from the shared seed data file.
 * Safe to run multiple times — uses INSERT ... ON CONFLICT DO UPDATE.
 */

import { db } from "../index";
import { mfrIndustries, mfrCategories, mfrProducts } from "../schema";
import { log } from "../../utils/logger";
import {
  MANUFACTURER_INDUSTRIES,
  MANUFACTURER_CATEGORIES,
  MANUFACTURER_PRODUCTS,
} from "../../data/seedManufacturersData";

export async function seedManufacturerCatalog() {
  log("[seed] manufacturer-catalog: starting…");

  // ── 1. Industries ──────────────────────────────────────────────────────────
  for (const ind of MANUFACTURER_INDUSTRIES) {
    await db
      .insert(mfrIndustries)
      .values({
        id: ind.id,
        name: ind.name,
        slug: ind.slug,
        icon: ind.icon,
        emoji: ind.emoji,
        description: ind.description,
        certifications: ind.certifications,
        routePath: ind.routePath,
        sortOrder: ind.sortOrder,
      })
      .onConflictDoUpdate({
        target: mfrIndustries.id,
        set: {
          name: ind.name,
          slug: ind.slug,
          icon: ind.icon,
          emoji: ind.emoji,
          description: ind.description,
          certifications: ind.certifications,
          routePath: ind.routePath,
          sortOrder: ind.sortOrder,
        },
      });
  }
  log(`[seed] manufacturer-catalog: ${MANUFACTURER_INDUSTRIES.length} industries upserted`);

  // ── 2. Categories ──────────────────────────────────────────────────────────
  for (const cat of MANUFACTURER_CATEGORIES) {
    await db
      .insert(mfrCategories)
      .values({
        id: cat.id,
        industryId: cat.industryId,
        name: cat.name,
        subcategories: cat.subcategories,
        materials: cat.materials,
        certifications: cat.certifications,
        tolerances: cat.tolerances,
        surfaceFinishes: cat.surfaceFinishes,
        dimensionTemplate: cat.dimensionTemplate,
        sortOrder: cat.sortOrder,
      })
      .onConflictDoUpdate({
        target: mfrCategories.id,
        set: {
          name: cat.name,
          subcategories: cat.subcategories,
          materials: cat.materials,
          certifications: cat.certifications,
          tolerances: cat.tolerances,
          surfaceFinishes: cat.surfaceFinishes,
          dimensionTemplate: cat.dimensionTemplate,
          sortOrder: cat.sortOrder,
        },
      });
  }
  log(`[seed] manufacturer-catalog: ${MANUFACTURER_CATEGORIES.length} categories upserted`);

  // ── 3. Products ────────────────────────────────────────────────────────────
  for (const prod of MANUFACTURER_PRODUCTS) {
    await db
      .insert(mfrProducts)
      .values({
        id: prod.id,
        industryId: prod.industryId,
        categoryId: prod.categoryId,
        name: prod.name,
        subcategory: prod.subcategory,
        description: prod.description,
        grade: prod.grade,
        unit: prod.unit,
        priceMin: String(prod.priceMin),
        priceMax: String(prod.priceMax),
        leadTimeDays: prod.leadTimeDays,
        certifications: prod.certifications,
        specifications: prod.specifications,
        sortOrder: prod.sortOrder,
      })
      .onConflictDoUpdate({
        target: mfrProducts.id,
        set: {
          name: prod.name,
          subcategory: prod.subcategory,
          description: prod.description,
          grade: prod.grade,
          unit: prod.unit,
          priceMin: String(prod.priceMin),
          priceMax: String(prod.priceMax),
          leadTimeDays: prod.leadTimeDays,
          certifications: prod.certifications,
          specifications: prod.specifications,
          sortOrder: prod.sortOrder,
        },
      });
  }
  log(`[seed] manufacturer-catalog: ${MANUFACTURER_PRODUCTS.length} products upserted`);

  log("[seed] manufacturer-catalog: done ✓");
}
