/**
 * Seeds the first super-admin into the admin_users table.
 *
 * Usage:
 *   npx ts-node src/db/seed/admin.seed.ts
 *
 * Credentials are read from env vars (fall back to defaults for dev):
 *   ADMIN_EMAIL     – defaults to admin@hansetu.com
 *   ADMIN_USERNAME  – defaults to hansetu_admin
 *   ADMIN_PASSWORD  – defaults to Admin@123456  ← change immediately after first login
 *   ADMIN_FIRST_NAME – defaults to Super
 *   ADMIN_LAST_NAME  – defaults to Admin
 */

import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { adminUsers } from "../schema";

dotenv.config();

export async function seedAdmin() {
  const email     = process.env.ADMIN_EMAIL      ?? "admin@hansetu.com";
  const username  = process.env.ADMIN_USERNAME   ?? "hansetu_admin";
  const password  = process.env.ADMIN_PASSWORD   ?? "Admin@123456";
  const firstName = process.env.ADMIN_FIRST_NAME ?? "Super";
  const lastName  = process.env.ADMIN_LAST_NAME  ?? "Admin";

  console.log("Seeding super-admin...");

  const [existing] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email));

  if (existing) {
    console.log(`  ✓ Admin already exists: ${email} (skipped)`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(adminUsers).values({
    email,
    username,
    password: hashedPassword,
    firstName,
    lastName,
    isActive: true,
  });

  console.log(`  ✓ Super-admin created`);
  console.log(`     Email   : ${email}`);
  console.log(`     Username: ${username}`);
  console.log(`     Password: ${password}`);
  console.log("  ⚠  Change the password immediately after first login!");
}

// Standalone entry point
if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Admin seed failed:", err);
      process.exit(1);
    });
}
