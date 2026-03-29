/**
 * Database Seeder
 *
 * Run with: npm run db:seed
 *
 * Seeds all reference data into the database. Safe to run multiple times —
 * uses upsert (insert or ignore on conflict).
 */

import { db } from "../index";
import { log, logError } from "../../utils/logger";

async function runSeeds() {
  log("Starting database seeding…");

  try {
    // Future seed runners will be imported and called here:
    // await seedIndustries();
    // await seedCategories();
    // await seedMaterials();
    // await seedManufacturers();

    log("Database seeding completed successfully.");
  } catch (err) {
    logError(`Seeding failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

runSeeds();
