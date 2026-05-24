/**
 * Catalogue V2 migration — clean-slate for catalogue tables.
 *
 * What this does:
 *  1. Truncates and restructures categories (adds industry_id FK)
 *  2. Drops and recreates products with full new schema
 *  3. Creates product_services junction table
 *  4. Drops and recreates nav_raw_material_categories with new schema
 *
 * Run with: npx ts-node src/db/migrations/catalogue_v2.ts
 */

import { pool } from "../index";

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("🚀 Starting catalogue_v2 migration...");

    // ── 1. Drop product_services if it exists ─────────────────────────────────
    await client.query(`DROP TABLE IF EXISTS product_services CASCADE`);
    console.log("✓ Dropped product_services");

    // ── 2. Drop products (clean slate) ────────────────────────────────────────
    await client.query(`DROP TABLE IF EXISTS products CASCADE`);
    console.log("✓ Dropped products");

    // ── 3. Clear subcategories and categories for clean re-seed ───────────────
    await client.query(`TRUNCATE TABLE subcategories CASCADE`);
    await client.query(`TRUNCATE TABLE categories CASCADE`);
    console.log("✓ Cleared categories and subcategories");

    // ── 4. Add industry_id to categories (after truncate so no data to migrate)
    await client.query(`
      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industries(id) ON DELETE CASCADE
    `);
    console.log("✓ Added industry_id to categories");

    // ── 5. Recreate products with full new schema ─────────────────────────────
    await client.query(`
      CREATE TABLE products (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        manufacturer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        industry_id         UUID REFERENCES industries(id) ON DELETE CASCADE,
        category_id         UUID REFERENCES categories(id) ON DELETE CASCADE,
        subcategory_id      UUID REFERENCES subcategories(id) ON DELETE SET NULL,

        name                VARCHAR(500) NOT NULL,
        description         TEXT,
        thumbnail_url       TEXT,

        material_type       VARCHAR(255),
        grade               VARCHAR(255),
        specifications      JSONB DEFAULT '{}'::jsonb,

        moq                 INTEGER,
        lead_time           VARCHAR(100),

        price               NUMERIC(10, 2),
        original_price      NUMERIC(10, 2),
        brand               VARCHAR(255),

        samples_available   BOOLEAN DEFAULT false,
        in_stock            BOOLEAN DEFAULT true,

        rating              NUMERIC(3, 1) DEFAULT 0,
        reviews             INTEGER DEFAULT 0,

        created_at          TIMESTAMP DEFAULT NOW(),
        updated_at          TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created new products table");

    // ── 6. Create product_services junction table ─────────────────────────────
    await client.query(`
      CREATE TABLE product_services (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        service_type VARCHAR(50) NOT NULL,
        service_id   UUID NOT NULL,
        created_at   TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created product_services table");

    // ── 7. Recreate nav_raw_material_categories with new schema ───────────────
    await client.query(`DROP TABLE IF EXISTS nav_raw_material_categories CASCADE`);
    await client.query(`
      CREATE TABLE nav_raw_material_categories (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
        label       VARCHAR(255) NOT NULL,
        slug        VARCHAR(100) NOT NULL UNIQUE,
        icon        VARCHAR(100),
        sort_order  INTEGER DEFAULT 0,
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Recreated nav_raw_material_categories");

    await client.query("COMMIT");
    console.log("✅ catalogue_v2 migration complete!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
