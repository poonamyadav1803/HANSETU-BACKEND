/**
 * Migration: drop unique constraint on rfq_assignments.rfq_id
 *
 * Admin needs to be able to invite multiple suppliers/manufacturers to quote
 * on the same RFQ (one row per candidate) instead of being limited to one.
 *
 * Run with: npx ts-node --transpile-only src/db/migrations/drop_rfq_assignments_rfq_id_unique.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: drop_rfq_assignments_rfq_id_unique");

  try {
    await db.execute(sql`ALTER TABLE rfq_assignments DROP CONSTRAINT IF EXISTS rfq_assignments_rfq_id_unique`);
    log("  ✓ rfq_assignments_rfq_id_unique constraint dropped");

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
