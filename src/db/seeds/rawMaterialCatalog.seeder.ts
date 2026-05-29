import { db } from "../index";
import { navRawMaterialCategories, rawMaterialProducts } from "../schema";
import { CATALOG_CATEGORIES, CATALOG_PRODUCTS, NAV_RAW_MATERIAL_GROUPS } from "../../data/rawMaterialCatalogData";
import { log } from "../../utils/logger";
import { count } from "drizzle-orm";

// Build a slug → groupName lookup from NAV_RAW_MATERIAL_GROUPS
function buildGroupMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const group of NAV_RAW_MATERIAL_GROUPS) {
    for (const slug of group.categories) {
      map[slug] = group.groupName;
    }
  }
  return map;
}

export async function seedRawMaterialCatalog() {
  log("Seeding raw material catalog (navRawMaterialCategories + rawMaterialProducts)...");

  const groupMap = buildGroupMap();

  // 1. Upsert navRawMaterialCategories with groupName + subcategories
  for (const cat of CATALOG_CATEGORIES) {
    await db
      .insert(navRawMaterialCategories)
      .values({
        slug: cat.id,
        label: cat.name,
        icon: null,
        groupName: groupMap[cat.id] ?? null,
        subcategories: cat.subcategories,
        sortOrder: CATALOG_CATEGORIES.indexOf(cat),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: navRawMaterialCategories.slug,
        set: {
          label: cat.name,
          groupName: groupMap[cat.id] ?? null,
          subcategories: cat.subcategories,
          sortOrder: CATALOG_CATEGORIES.indexOf(cat),
          updatedAt: new Date(),
        },
      });
  }

  log(`  ✓ ${CATALOG_CATEGORIES.length} nav categories upserted`);

  // 2. Seed rawMaterialProducts — skip entirely if table is already populated
  const [{ value: existing }] = await db.select({ value: count() }).from(rawMaterialProducts);
  if (Number(existing) === 0) {
    await db.insert(rawMaterialProducts).values(
      CATALOG_PRODUCTS.map((p) => ({
        categorySlug: p.categoryId,
        subcategory: p.subcategory,
        name: p.name,
        grade: p.grade,
        unit: p.unit,
        priceMin: String(p.priceMin),
        priceMax: String(p.priceMax),
        specifications: p.specifications,
        isActive: true,
      }))
    );
    log(`  ✓ ${CATALOG_PRODUCTS.length} raw material products seeded`);
  } else {
    log(`  ⟳ raw_material_products already has ${existing} rows — skipping`);
  }
}
