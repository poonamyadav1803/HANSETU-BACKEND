/**
 * Migration: RFQ v2 — add request_type to rfq_requests, create shipments table
 *
 * Run with: npx ts-node --transpile-only src/db/migrations/rfq_v2_shipments.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: rfq_v2_shipments");

  try {
    // 1. Add request_type to rfq_requests
    await db.execute(sql`
      ALTER TABLE rfq_requests
      ADD COLUMN IF NOT EXISTS request_type VARCHAR(50) NOT NULL DEFAULT 'PRODUCT_CATALOGUE'
    `);
    log("  ✓ request_type added to rfq_requests");

    // 2. Create shipments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_number VARCHAR(50) UNIQUE NOT NULL,
        po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
        rfq_id UUID NOT NULL REFERENCES rfq_requests(id) ON DELETE RESTRICT,
        buyer_id UUID NOT NULL REFERENCES users(id),
        supplier_id UUID NOT NULL REFERENCES users(id),
        transporter_name VARCHAR(255),
        docket_number VARCHAR(100),
        dispatch_date VARCHAR(50),
        eway_bill_no VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'DISPATCHED',
        checkpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
        delivered_at TIMESTAMP,
        received_by_buyer_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log("  ✓ shipments table created");

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
