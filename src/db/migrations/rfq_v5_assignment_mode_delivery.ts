/**
 * Migration: RFQ v5 — assignment mode + delivery quote fields
 * Run with: npx ts-node --transpile-only src/db/migrations/rfq_v5_assignment_mode_delivery.ts
 */
import { db } from "..";

function log(message: string) {
  // eslint-disable-next-line no-console
  console.log(message);
}

async function main() {
  log("Running migration: rfq_v5_assignment_mode_delivery");

  await db.execute(`
    ALTER TABLE rfq_assignments
    ADD COLUMN IF NOT EXISTS assignment_mode VARCHAR(30) DEFAULT 'REQUEST_QUOTE' NOT NULL,
    ADD COLUMN IF NOT EXISTS transport_company VARCHAR(255),
    ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC(14,2)
  `);

  log("  ✓ assignment_mode, transport_company, delivery_charge ensured");
  log("Done");
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", err);
  process.exit(1);
});
