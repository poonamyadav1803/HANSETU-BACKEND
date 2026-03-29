import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });
  console.log("Migrations complete.");

  await pool.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
