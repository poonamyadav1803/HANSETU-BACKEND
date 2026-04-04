/**
 * Migration: Create manufacturers, raw_materials, machines, offers tables
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/create_new_tables.ts
 */

import { db, pool } from "../index";
import { sql } from "drizzle-orm";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: create_new_tables");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS manufacturers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        industry_slug VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        total_employees VARCHAR(50),
        turnover VARCHAR(100),
        year_established VARCHAR(10),
        certifications TEXT,
        in_house_testing BOOLEAN DEFAULT false,
        import_export BOOLEAN DEFAULT false,
        response_time VARCHAR(50),
        rating NUMERIC(3,1) DEFAULT 0,
        machine_capabilities TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ manufacturers table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS raw_materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        industry_slug VARCHAR(100) NOT NULL,
        name VARCHAR(500) NOT NULL,
        category VARCHAR(255),
        price VARCHAR(100) NOT NULL,
        grade VARCHAR(255),
        city VARCHAR(100),
        imported BOOLEAN DEFAULT false,
        credit_available BOOLEAN DEFAULT false,
        quantity VARCHAR(100),
        rating NUMERIC(3,1) DEFAULT 0,
        description TEXT,
        specifications TEXT,
        certification VARCHAR(255),
        delivery_time VARCHAR(100),
        min_order VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ raw_materials table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS machines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        category VARCHAR(255) NOT NULL,
        type VARCHAR(255),
        location VARCHAR(100),
        price VARCHAR(100) NOT NULL,
        specs TEXT,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ machines table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        discount VARCHAR(20) NOT NULL,
        time_remaining VARCHAR(100),
        category VARCHAR(255),
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ offers table ready");

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
