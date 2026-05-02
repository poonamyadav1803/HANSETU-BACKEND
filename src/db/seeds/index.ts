/**
 * Database Seeder — Run with: npm run db:seed
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
import { seedCalibrationServices } from "./calibration.seeder";
import { seedTestingServices } from "./testing.seeder";
import { seedHrServices } from "./hr.seeder";
import { seedTrainingPrograms } from "./training.seeder";
import { seedStudentServices } from "./student.seeder";
import { seedFinancialServices } from "./financial.seeder";
import { seedSuppliers } from "./supplier.seeder";
import { seedWizardNavigationData } from "./wizard-navigation.seeder";
import { seedRbac } from "../seed/rbac.seed";

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
    await seedCalibrationServices();
    await seedTestingServices();
    await seedHrServices();
    await seedTrainingPrograms();
    await seedStudentServices();
    await seedFinancialServices();
    await seedSuppliers();
    await seedWizardNavigationData();
    await seedRbac();

    log("═══════════════════════════════════════════");
    log("  All seeds completed successfully.");
    log("═══════════════════════════════════════════");
  } catch (err) {
    logError(`Seeding failed: ${(err as Error).message}`);
    console.error(err);
    process.exit(1);
  } finally {
    const { pool } = await import("../index");
    await pool.end();
  }
}

runSeeds();
