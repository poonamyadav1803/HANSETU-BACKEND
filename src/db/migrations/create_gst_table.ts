/**
 * Migration: Create gst_info table for caching Masters India API results
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/create_gst_table.ts
 */

import { db, pool } from "../index";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Running migration: create_gst_table");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gst_info (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gst_number VARCHAR(20) UNIQUE NOT NULL,
        legal_name VARCHAR(500),
        trade_name VARCHAR(500),
        registration_status VARCHAR(100),
        date_of_registration VARCHAR(50),
        constitution_of_business VARCHAR(255),
        principal_place_of_business TEXT,
        nature_of_business_activities TEXT,
        raw_api_response TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("✓ gst_info table created");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
