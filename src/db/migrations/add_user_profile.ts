import { db } from "../index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Adding profile column to users table...");

  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile JSONB
  `);

  console.log("Migration complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
