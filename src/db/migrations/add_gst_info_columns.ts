/**
 * Migration: Add extended columns to gst_info table
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/add_gst_info_columns.ts
 */

import { db, pool } from "../index";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Running migration: add_gst_info_columns");

  try {
    await db.execute(sql`
      ALTER TABLE gst_info
        ADD COLUMN IF NOT EXISTS state_jurisdiction        TEXT,
        ADD COLUMN IF NOT EXISTS state_jurisdiction_code   VARCHAR(10),
        ADD COLUMN IF NOT EXISTS dealer_type               VARCHAR(50),
        ADD COLUMN IF NOT EXISTS cancellation_date         DATE,
        ADD COLUMN IF NOT EXISTS additional_addresses      JSONB,
        ADD COLUMN IF NOT EXISTS last_updated_at_gstn      DATE,
        ADD COLUMN IF NOT EXISTS last_verified_at          TIMESTAMPTZ
    `);

    console.log("✓ gst_info columns added");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
