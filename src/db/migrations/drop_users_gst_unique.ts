/**
 * Migration: drop unique constraint on users.gst_number
 *
 * Multiple user accounts (e.g. different roles/departments at the same
 * company) should be able to register under the same GST number.
 *
 * Run with: npx ts-node --transpile-only src/db/migrations/drop_users_gst_unique.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: drop_users_gst_unique");

  try {
    await db.execute(sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_gst_number_unique`);
    log("  ✓ users_gst_number_unique constraint dropped");

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
