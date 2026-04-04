/**
 * Database Provider Migration Script
 *
 * Migrates all data from a source PostgreSQL database (e.g. Neon) to a
 * target PostgreSQL database (e.g. AWS RDS, Supabase, Railway, etc.).
 *
 * Usage:
 *   SOURCE_DB_URL=<source> TARGET_DB_URL=<target> npm run migrate:provider
 *
 * What it does:
 *   1. Runs Drizzle schema migrations on the TARGET database (creates all tables)
 *   2. Copies all rows table-by-table from SOURCE → TARGET using INSERT ON CONFLICT DO NOTHING
 *   3. Reports row counts per table
 *
 * Safe to re-run — uses INSERT … ON CONFLICT DO NOTHING (upsert-safe).
 */

import { Pool, PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const SOURCE_DB_URL = process.env.SOURCE_DB_URL || process.env.DATABASE_URL;
const TARGET_DB_URL = process.env.TARGET_DB_URL;

const MIGRATIONS_FOLDER = path.join(__dirname, "../src/db/migrations");

// Tables in dependency order (parents before children)
const TABLES_IN_ORDER = [
  "industries",
  "categories",
  "subcategories",
  "products",
  "users",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function makePool(url: string, label: string): Pool {
  console.log(`[migrate] Connecting to ${label}...`);
  return new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
}

async function getRowCount(client: PoolClient, table: string): Promise<number> {
  const result = await client.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM "${table}"`
  );
  return parseInt(result.rows[0].count, 10);
}

async function copyTable(
  sourceClient: PoolClient,
  targetClient: PoolClient,
  table: string
): Promise<number> {
  const { rows } = await sourceClient.query(`SELECT * FROM "${table}"`);

  if (rows.length === 0) {
    console.log(`  [${table}] No rows to migrate.`);
    return 0;
  }

  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

  let inserted = 0;

  for (const row of rows) {
    const values = columns.map((c) => row[c]);
    await targetClient.query(
      `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values
    );
    inserted++;
  }

  return inserted;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  if (!SOURCE_DB_URL) {
    console.error("ERROR: SOURCE_DB_URL (or DATABASE_URL) must be set.");
    process.exit(1);
  }
  if (!TARGET_DB_URL) {
    console.error(
      "ERROR: TARGET_DB_URL must be set.\n" +
        "Usage: SOURCE_DB_URL=<neon-url> TARGET_DB_URL=<aws-rds-url> npm run migrate:provider"
    );
    process.exit(1);
  }

  const sourcePool = makePool(SOURCE_DB_URL, "SOURCE");
  const targetPool = makePool(TARGET_DB_URL, "TARGET");

  const sourceClient = await sourcePool.connect();
  const targetClient = await targetPool.connect();

  try {
    // ── Step 1: Run Drizzle migrations on target ─────────────────────────────
    console.log("\n[migrate] Step 1: Applying schema migrations to TARGET...");
    const targetDb = drizzle(targetPool);
    await migrate(targetDb, { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("[migrate] Schema migrations applied.\n");

    // ── Step 2: Copy data table by table ────────────────────────────────────
    console.log("[migrate] Step 2: Copying data...\n");

    const summary: { table: string; source: number; migrated: number }[] = [];

    for (const table of TABLES_IN_ORDER) {
      const sourceCount = await getRowCount(sourceClient, table);
      console.log(`  [${table}] ${sourceCount} rows in source.`);

      const migrated = await copyTable(sourceClient, targetClient, table);
      console.log(`  [${table}] ${migrated} rows inserted into target.\n`);

      summary.push({ table, source: sourceCount, migrated });
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════════════");
    console.log("  Migration Summary");
    console.log("═══════════════════════════════════════════════════");
    console.log(
      `${"Table".padEnd(22)} ${"Source".padStart(8)} ${"Inserted".padStart(10)}`
    );
    console.log("─".repeat(44));
    for (const row of summary) {
      console.log(
        `${row.table.padEnd(22)} ${String(row.source).padStart(8)} ${String(row.migrated).padStart(10)}`
      );
    }
    console.log("═══════════════════════════════════════════════════");
    console.log("  Migration complete!");
  } finally {
    sourceClient.release();
    targetClient.release();
    await sourcePool.end();
    await targetPool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] Fatal error:", err.message);
  process.exit(1);
});
