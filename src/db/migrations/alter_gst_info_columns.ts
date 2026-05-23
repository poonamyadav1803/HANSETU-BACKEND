/**
 * Migration: Redesign gst_info table
 * - Change cancellation_date and last_updated_at_gstn from DATE to VARCHAR(50)
 *   (WhiteBooks API returns dates as "DD/MM/YYYY" strings, not ISO dates)
 * - Add central_jurisdiction, central_jurisdiction_code, einvoice_status columns
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/alter_gst_info_columns.ts
 */

import { db, pool } from "../index";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Running migration: alter_gst_info_columns");

  try {
    await db.execute(sql`
      ALTER TABLE gst_info
        ALTER COLUMN cancellation_date   TYPE VARCHAR(50) USING cancellation_date::TEXT,
        ALTER COLUMN last_updated_at_gstn TYPE VARCHAR(50) USING last_updated_at_gstn::TEXT,
        ALTER COLUMN state_jurisdiction_code TYPE VARCHAR(20),
        ADD COLUMN IF NOT EXISTS central_jurisdiction       TEXT,
        ADD COLUMN IF NOT EXISTS central_jurisdiction_code  VARCHAR(20),
        ADD COLUMN IF NOT EXISTS einvoice_status            VARCHAR(10)
    `);

    console.log("✓ gst_info columns altered successfully");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
