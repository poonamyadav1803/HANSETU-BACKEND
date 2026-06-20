import { db } from "../index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Adding Razorpay + payment columns to sales_invoices and purchase_orders...");

  await db.execute(sql`
    ALTER TABLE sales_invoices
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
  `);

  await db.execute(sql`
    ALTER TABLE purchase_orders
      ADD COLUMN IF NOT EXISTS payment_released BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS payment_released_at TIMESTAMP;
  `);

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
