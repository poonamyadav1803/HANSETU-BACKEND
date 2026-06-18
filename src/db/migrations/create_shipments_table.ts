/**
 * Migration: Create shipments table for dispatched orders.
 *
 * Run with: npx ts-node-dev --transpile-only src/db/migrations/create_shipments_table.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: create_shipments_table");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_number VARCHAR(50) UNIQUE NOT NULL,
        order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        supplier_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        status VARCHAR(50) NOT NULL DEFAULT 'DISPATCHED',
        carrier_name VARCHAR(255),
        tracking_number VARCHAR(255),
        vehicle_number VARCHAR(50),
        eway_bill_number VARCHAR(100),
        eway_bill_document_url TEXT,
        dispatched_at TIMESTAMP NOT NULL DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    log("  ✓ shipments table ready");
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
