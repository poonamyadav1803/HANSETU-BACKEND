import { sql } from "drizzle-orm";
import { db } from "../index";

async function run() {
  console.log("Adding images to products table...");

  await db.execute(sql`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb NOT NULL
  `);

  console.log("Product images migration complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
