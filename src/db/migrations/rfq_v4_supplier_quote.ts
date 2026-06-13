/**
 * Migration: RFQ v4 — add supplier quote fields to rfq_assignments
 *
 * Run with: npx ts-node --transpile-only src/db/migrations/rfq_v4_supplier_quote.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: rfq_v4_supplier_quote");

  try {
    await db.execute(sql`
      ALTER TABLE rfq_assignments
      ADD COLUMN IF NOT EXISTS supplier_quoted_price   NUMERIC,
      ADD COLUMN IF NOT EXISTS supplier_lead_time_days INTEGER,
      ADD COLUMN IF NOT EXISTS supplier_moq            NUMERIC,
      ADD COLUMN IF NOT EXISTS quote_validity_date     VARCHAR(50),
      ADD COLUMN IF NOT EXISTS supplier_notes          TEXT,
      ADD COLUMN IF NOT EXISTS quote_submitted_at      TIMESTAMP
    `);
    log("  ✓ supplier quote columns added to rfq_assignments");

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
