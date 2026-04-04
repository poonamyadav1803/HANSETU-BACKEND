import { Database } from "../../config/database";

export class UserMigration {
  static async up() {
    const pool = Database.getPool();

    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gst_number VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL, 
        mobile VARCHAR(15) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        business_type VARCHAR(50) NOT NULL,
        email_verified BOOLEAN DEFAULT false,
        mobile_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(" Users table ready");
  }
}