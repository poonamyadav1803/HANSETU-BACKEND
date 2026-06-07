/**
 * Migration: Create orders table for confirmed buyer orders.
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/create_orders_table.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: create_orders_table");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rfq_id UUID UNIQUE NOT NULL REFERENCES rfq_requests(id) ON DELETE RESTRICT,
        assignment_id UUID REFERENCES rfq_assignments(id) ON DELETE SET NULL,
        source_type VARCHAR(30) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ORDER_CONFIRMED',
        total_amount NUMERIC(14,2),
        advance_payment_amount NUMERIC(14,2),
        advance_payment_method VARCHAR(50),
        advance_payment_reference VARCHAR(255),
        advance_payment_status VARCHAR(50) NOT NULL DEFAULT 'NOT_APPLICABLE',
        phase5_document_status VARCHAR(50) NOT NULL DEFAULT 'TRIGGERED',
        phase5_document_generation_triggered_at TIMESTAMP DEFAULT NOW(),
        phase5_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
        supplier_acknowledged_at TIMESTAMP,
        expected_dispatch_date DATE,
        supplier_certificate_files JSONB NOT NULL DEFAULT '[]'::jsonb,
        supplier_acknowledgement_notes TEXT,
        notes TEXT,
        confirmed_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    log("  ✓ orders table ready");
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
