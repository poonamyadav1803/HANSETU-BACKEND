/**
 * Migration: RFQ v3 — rename rfq_assignments columns to match simplified flow
 *
 * - admin_offered_price → negotiated_price
 * - finalized_at → approved_at
 * - negotiation_status: reset to simplified values (PENDING / APPROVED / REJECTED)
 *
 * Run with: npx ts-node --transpile-only src/db/migrations/rfq_v3_assignment_rename.ts
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../index";
import { log, logError } from "../../utils/logger";

async function migrate() {
  log("Running migration: rfq_v3_assignment_rename");

  try {
    // 1. Rename admin_offered_price → negotiated_price (if old column exists)
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'rfq_assignments' AND column_name = 'admin_offered_price'
        ) THEN
          ALTER TABLE rfq_assignments RENAME COLUMN admin_offered_price TO negotiated_price;
          RAISE NOTICE 'Renamed admin_offered_price to negotiated_price';
        ELSE
          RAISE NOTICE 'Column negotiated_price already exists or admin_offered_price missing — skipping';
        END IF;
      END
      $$
    `);
    log("  ✓ admin_offered_price → negotiated_price");

    // 2. Rename finalized_at → approved_at (if old column exists)
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'rfq_assignments' AND column_name = 'finalized_at'
        ) THEN
          ALTER TABLE rfq_assignments RENAME COLUMN finalized_at TO approved_at;
          RAISE NOTICE 'Renamed finalized_at to approved_at';
        ELSE
          RAISE NOTICE 'Column approved_at already exists or finalized_at missing — skipping';
        END IF;
      END
      $$
    `);
    log("  ✓ finalized_at → approved_at");

    // 3. Add negotiated_price column if it doesn't exist yet (fresh DB case)
    await db.execute(sql`
      ALTER TABLE rfq_assignments
      ADD COLUMN IF NOT EXISTS negotiated_price NUMERIC
    `);
    log("  ✓ negotiated_price column ensured");

    // 4. Add approved_at column if it doesn't exist yet (fresh DB case)
    await db.execute(sql`
      ALTER TABLE rfq_assignments
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
    `);
    log("  ✓ approved_at column ensured");

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
