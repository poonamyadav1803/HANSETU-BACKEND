/**
 * Migration: drop auto_orders table
 *
 * Run with: npx ts-node --transpile-only src/db/migrations/drop_auto_orders.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: drop_auto_orders");

  try {
    await db.execute(sql`DROP TABLE IF EXISTS auto_orders CASCADE`);
    log("  ✓ auto_orders table dropped");

    log("Migration complete.");
  } catch (err) {
    logError(`Migration failed: ${(err as Error).message}`);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
