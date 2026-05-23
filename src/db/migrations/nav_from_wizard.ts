/**
 * Populate nav_raw_material_categories from wizard_raw_material_categories.
 *
 * For each industry in INDUSTRY_RAW_MATERIAL_MAP, reads the matching rows from
 * wizard_raw_material_categories and upserts nav items linked to that industry.
 *
 * Slug format: `<industrySlug>--<categorySlug>` — unique per industry+category pair.
 *
 * Run with: npm run db:nav:from-wizard
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  navRawMaterialCategories,
  wizardRawMaterialCategories,
  industries,
} from "../schema";
import { INDUSTRY_RAW_MATERIAL_MAP } from "../../data/wizardData";

const ICON_MAP: Record<string, string> = {
  steel:            "hardware",
  aluminum:         "layers",
  copper:           "electric_bolt",
  plastics:         "bubble_chart",
  chemicals:        "science",
  rubber:           "radio_button_unchecked",
  glass:            "window",
  textiles:         "dry_cleaning",
  electronics:      "memory",
  construction:     "construction",
  wood:             "park",
  paper:            "description",
  minerals:         "diamond",
  metals:           "toll",
  energy:           "bolt",
  agro:             "grass",
  pharma:           "medication",
  "food-ingredients": "restaurant",
  petrochemicals:   "local_gas_station",
  "paints-pigments": "palette",
  adhesives:        "water_drop",
  "welding-gases":  "whatshot",
  abrasives:        "grain",
  composites:       "layers",
};

async function run() {
  console.log("🔄 Syncing nav_raw_material_categories from wizard data...");

  // 1. Load all wizard categories into a slug→record map
  const wizardRows = await db.select().from(wizardRawMaterialCategories);
  const wizardBySlug = Object.fromEntries(wizardRows.map((r) => [r.slug, r]));
  console.log(`  Loaded ${wizardRows.length} wizard categories`);

  // 2. Load all industries into a slug→record map
  const industryRows = await db.select().from(industries);
  const industryBySlug = Object.fromEntries(industryRows.map((r) => [r.slug, r]));
  console.log(`  Loaded ${industryRows.length} industries`);

  let inserted = 0;
  let skipped = 0;

  // 3. Walk INDUSTRY_RAW_MATERIAL_MAP
  for (const [industrySlug, mapping] of Object.entries(INDUSTRY_RAW_MATERIAL_MAP)) {
    const industry = industryBySlug[industrySlug];
    if (!industry) {
      console.warn(`  ⚠ No DB row for industry slug "${industrySlug}" — skipping`);
      skipped++;
      continue;
    }

    for (let i = 0; i < mapping.rawCatIds.length; i++) {
      const catId = mapping.rawCatIds[i];
      const wizard = wizardBySlug[catId];
      if (!wizard) {
        console.warn(`  ⚠ No wizard category for slug "${catId}" — skipping`);
        skipped++;
        continue;
      }

      const navSlug = `${industrySlug}--${catId}`;

      await db
        .insert(navRawMaterialCategories)
        .values({
          slug:       navSlug,
          label:      wizard.name,
          industryId: industry.id,
          icon:       ICON_MAP[catId] ?? null,
          sortOrder:  i,
        })
        .onConflictDoUpdate({
          target: navRawMaterialCategories.slug,
          set: {
            label:      wizard.name,
            industryId: industry.id,
            icon:       ICON_MAP[catId] ?? null,
            sortOrder:  i,
            updatedAt:  new Date(),
          },
        });

      inserted++;
    }
  }

  console.log(`✅ Done — ${inserted} nav items upserted, ${skipped} skipped`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
