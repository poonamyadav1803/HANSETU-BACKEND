import { db } from "../index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Running RBAC migration...");

  // 1. Add role column to users
  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'
  `);

  // 2. Create roles table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS roles (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 3. Create permissions table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS permissions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100) UNIQUE NOT NULL,
      resource    VARCHAR(50) NOT NULL,
      action      VARCHAR(50) NOT NULL,
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 4. Create role_permissions join table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    )
  `);

  console.log("RBAC migration complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
