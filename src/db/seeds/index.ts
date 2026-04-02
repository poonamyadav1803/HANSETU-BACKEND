/**
 * Database Seeder
 *
 * Run with: npm run db:seed
 *
 * Seeds all reference data into the database.
 * Safe to run multiple times — all seeders use upsert (skip on conflict).
 */

import { db } from "../index";
import { log, logError } from "../../utils/logger";
import { seedIndustries } from "./industry.seeder";
import { seedCategories } from "./category.seeder";
import { seedManufacturers } from "./manufacturer.seeder";
import { seedRawMaterials } from "./raw_material.seeder";
import { seedMachines } from "./machine.seeder";
import { seedOffers } from "./offer.seeder";

async function runSeeds() {
  log("═══════════════════════════════════════════");
  log("  Hansetu Database Seeder");
  log("═══════════════════════════════════════════");

  try {
    await seedIndustries();
    await seedCategories();
    await seedManufacturers();
    await seedRawMaterials();
    await seedMachines();
    await seedOffers();

    log("═══════════════════════════════════════════");
    log("  All seeds completed successfully.");
    log("═══════════════════════════════════════════");
  } catch (err) {
    logError(`Seeding failed: ${(err as Error).message}`);
    console.error(err);
    process.exit(1);
  } finally {
    // Gracefully close the pool
    const { pool } = await import("../index");
    await pool.end();
  }
}

runSeeds();
