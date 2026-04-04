/**
 * Migration: Create service tables
 * calibration_services, testing_services, hr_services, training_programs,
 * student_services, financial_services, suppliers
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/create_service_tables.ts
 */

import { db, pool } from "../index";
import { sql } from "drizzle-orm";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: create_service_tables");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS calibration_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        industry_slug VARCHAR(100),
        city VARCHAR(100),
        price VARCHAR(100),
        accreditation VARCHAR(255),
        door_delivery BOOLEAN DEFAULT false,
        visit_services BOOLEAN DEFAULT false,
        response_time VARCHAR(100),
        rating NUMERIC(3,1) DEFAULT 0,
        instruments TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ calibration_services table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS testing_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        category VARCHAR(255),
        provider VARCHAR(255),
        industry_slug VARCHAR(100),
        price VARCHAR(100),
        turnaround VARCHAR(100),
        city VARCHAR(100),
        rating NUMERIC(3,1) DEFAULT 0,
        certifications TEXT,
        test_types TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ testing_services table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hr_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL,
        industry_slug VARCHAR(100),
        company VARCHAR(255),
        type VARCHAR(100),
        experience VARCHAR(100),
        salary VARCHAR(100),
        city VARCHAR(100),
        rating NUMERIC(3,1) DEFAULT 0,
        skills TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ hr_services table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS training_programs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        category VARCHAR(255),
        industry_slug VARCHAR(100),
        provider VARCHAR(255),
        price VARCHAR(100),
        duration VARCHAR(100),
        mode VARCHAR(100),
        city VARCHAR(100),
        rating NUMERIC(3,1) DEFAULT 0,
        capacity VARCHAR(100),
        certification VARCHAR(255),
        skills TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ training_programs table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS student_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        category VARCHAR(255),
        industry_slug VARCHAR(100),
        provider VARCHAR(255),
        type VARCHAR(100),
        duration VARCHAR(100),
        stipend VARCHAR(100),
        city VARCHAR(100),
        rating NUMERIC(3,1) DEFAULT 0,
        skills TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ student_services table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS financial_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        category VARCHAR(255),
        industry_slug VARCHAR(100),
        provider VARCHAR(255),
        type VARCHAR(100),
        interest_rate VARCHAR(50),
        amount VARCHAR(100),
        city VARCHAR(100),
        rating NUMERIC(3,1) DEFAULT 0,
        features TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ financial_services table ready");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(500) NOT NULL,
        industry_slug VARCHAR(100) NOT NULL,
        material_category VARCHAR(255),
        location VARCHAR(255),
        materials TEXT,
        rating NUMERIC(3,1) DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        min_order VARCHAR(100),
        price VARCHAR(100),
        certifications TEXT,
        established VARCHAR(10),
        employees VARCHAR(50),
        contact VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    log("  ✓ suppliers table ready");

    log("Migration complete. All service tables created.");
  } catch (err) {
    logError(`Migration failed: ${(err as Error).message}`);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
