import { Pool } from "pg";
import { env } from "./env";

export class Database {
  private static pool: Pool;

  static async connect() {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log("Connected to Neon");
  }

  static getPool() {
    if (!this.pool) throw new Error("DB not initialized");
    return this.pool;
  }
}