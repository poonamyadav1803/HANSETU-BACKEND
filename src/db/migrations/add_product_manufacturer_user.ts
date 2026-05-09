import { db } from "../index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Adding manufacturer_user_id to products table...");

  await db.execute(sql`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS manufacturer_user_id UUID REFERENCES users(id) ON DELETE SET NULL
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS products_manufacturer_user_id_idx
      ON products (manufacturer_user_id)
  `);

  console.log("Product owner migration complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
