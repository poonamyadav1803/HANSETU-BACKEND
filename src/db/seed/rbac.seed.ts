/**
 * Seeds default roles, permissions, and an initial admin account.
 *
 * Usage:
 *   npx ts-node src/db/seed/rbac.seed.ts
 *
 * The admin password is read from the ADMIN_PASSWORD env variable (or falls
 * back to "Admin@123456" in development — change it immediately after first login).
 */

import bcrypt from "bcrypt";
import { db } from "../index";
import { roles, permissions, rolePermissions, users } from "../schema";
import { eq, sql } from "drizzle-orm";

const PERMISSIONS = [
  { name: "users:read",         resource: "users",       action: "read",     description: "List and view all users" },
  { name: "users:manage",       resource: "users",       action: "manage",   description: "Activate / deactivate users" },
  { name: "users:role",         resource: "users",       action: "role",     description: "Change a user's system role" },
  { name: "profile:edit",       resource: "profile",     action: "edit",     description: "Edit own business profile" },
  { name: "marketplace:access", resource: "marketplace", action: "access",   description: "Browse marketplace listings" },
  { name: "gst:verify",         resource: "gst",         action: "verify",   description: "Verify a GSTIN number" },
  { name: "admin:access",       resource: "admin",       action: "access",   description: "Access the admin panel" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["users:read", "users:manage", "users:role", "profile:edit", "marketplace:access", "gst:verify", "admin:access"],
  user:  ["profile:edit", "marketplace:access", "gst:verify"],
};

async function ensureRbacSchema() {
  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'
  `);

  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile JSONB
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS roles (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

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

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    )
  `);
}

async function seed() {
  console.log("Seeding RBAC roles and permissions...");
  await ensureRbacSchema();

  // ── Permissions ──────────────────────────────────────────────────────────────
  for (const perm of PERMISSIONS) {
    await db
      .insert(permissions)
      .values(perm)
      .onConflictDoUpdate({ target: permissions.name, set: { description: perm.description } });
  }
  console.log(`  ✓ ${PERMISSIONS.length} permissions upserted`);

  // ── Roles ────────────────────────────────────────────────────────────────────
  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    await db
      .insert(roles)
      .values({ name: roleName, description: `${roleName} role` })
      .onConflictDoUpdate({ target: roles.name, set: { description: `${roleName} role` } });
  }
  console.log(`  ✓ ${Object.keys(ROLE_PERMISSIONS).length} roles upserted`);

  // ── Role → Permission mappings ───────────────────────────────────────────────
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const [role] = await db.select().from(roles).where(eq(roles.name, roleName));
    if (!role) continue;

    for (const permName of permNames) {
      const [perm] = await db.select().from(permissions).where(eq(permissions.name, permName));
      if (!perm) continue;
      await db
        .insert(rolePermissions)
        .values({ roleId: role.id, permissionId: perm.id })
        .onConflictDoNothing();
    }
  }
  console.log("  ✓ Role-permission mappings set");

  // ── Initial admin account ────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    ?? "admin@hansetu.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";
  const adminUsername = process.env.ADMIN_USERNAME ?? "hansetu_admin";

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail));
  if (existing) {
    // Ensure existing account is promoted to admin role
    await db.update(users).set({ role: "admin" }).where(eq(users.email, adminEmail));
    console.log(`  ✓ Existing user ${adminEmail} promoted to admin`);
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({
      gstNumber:     "ADMIN000000000000",
      email:         adminEmail,
      mobile:        "0000000000",
      username:      adminUsername,
      password:      hashedPassword,
      businessType:  "manufacturer",
      role:          "admin",
      emailVerified: true,
      mobileVerified: true,
      isActive:      true,
    });
    console.log(`  ✓ Admin account created: ${adminEmail} / ${adminPassword}`);
    console.log("  ⚠  Change the admin password immediately after first login!");
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
