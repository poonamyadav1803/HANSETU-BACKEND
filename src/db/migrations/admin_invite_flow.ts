import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Creating admin_users table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       VARCHAR(255) UNIQUE NOT NULL,
        username    VARCHAR(100) UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        first_name  VARCHAR(100) NOT NULL,
        last_name   VARCHAR(100) NOT NULL,
        is_active   BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Creating admin_invitations table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_invitations (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       VARCHAR(255) NOT NULL,
        token       VARCHAR(500) UNIQUE NOT NULL,
        status      VARCHAR(20) NOT NULL DEFAULT 'pending',
        invited_by  UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        expires_at  TIMESTAMP NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query("COMMIT");
    console.log("Migration complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
