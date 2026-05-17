import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  console.log("Creating raw_material_orders table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS raw_material_orders (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      manufacturer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      material_name        VARCHAR(500) NOT NULL,
      supplier_name        VARCHAR(500) NOT NULL,
      quantity             VARCHAR(100) NOT NULL,
      price                VARCHAR(100) NOT NULL,
      status               VARCHAR(50)  NOT NULL DEFAULT 'pending',
      problem_description  TEXT,
      order_date           DATE         NOT NULL,
      city                 VARCHAR(100),
      created_at           TIMESTAMP DEFAULT NOW(),
      updated_at           TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("Creating supplier_inventory table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS supplier_inventory (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      supplier_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      material_name    VARCHAR(500) NOT NULL,
      category         VARCHAR(255) NOT NULL,
      quantity         VARCHAR(100) NOT NULL,
      price            VARCHAR(100) NOT NULL,
      status           VARCHAR(50)  NOT NULL DEFAULT 'available',
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("Creating supplier_transactions table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS supplier_transactions (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      supplier_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      buyer_name       VARCHAR(500) NOT NULL,
      material_name    VARCHAR(500) NOT NULL,
      amount           VARCHAR(100) NOT NULL,
      status           VARCHAR(50)  NOT NULL DEFAULT 'pending',
      transaction_date DATE         NOT NULL,
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("All dashboard tables created successfully.");
  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
