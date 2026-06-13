/**
 * Migration: Add supplier acknowledgement fields to orders.
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/add_order_supplier_acknowledgement.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: add_order_supplier_acknowledgement");

  try {
    await db.execute(sql`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS supplier_acknowledged_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS expected_dispatch_date DATE,
        ADD COLUMN IF NOT EXISTS supplier_certificate_files JSONB NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS supplier_acknowledgement_notes TEXT
    `);

    log("  ✓ supplier acknowledgement columns ready");
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
