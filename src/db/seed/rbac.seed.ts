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

// ─── Permission Definitions ───────────────────────────────────────────────────

const PERMISSIONS = [
  // Existing platform permissions
  { name: "users:read",              resource: "users",        action: "read",     description: "List and view all users" },
  { name: "users:manage",            resource: "users",        action: "manage",   description: "Activate / deactivate users" },
  { name: "users:role",              resource: "users",        action: "role",     description: "Change a user's system role" },
  { name: "profile:edit",            resource: "profile",      action: "edit",     description: "Edit own business profile" },
  { name: "marketplace:access",      resource: "marketplace",  action: "access",   description: "Browse marketplace listings" },
  { name: "gst:verify",              resource: "gst",          action: "verify",   description: "Verify a GSTIN number" },
  { name: "admin:access",            resource: "admin",        action: "access",   description: "Access the admin panel" },

  // ── RFQ — Buyer permissions ──────────────────────────────────────────────────
  { name: "rfq:submit",              resource: "rfq",          action: "submit",   description: "Submit a new RFQ" },
  { name: "rfq:view_own",            resource: "rfq",          action: "view_own", description: "View own RFQs and their status" },
  { name: "invoice:view_own",        resource: "invoice",      action: "view_own", description: "View own sales invoices" },
  { name: "shipment:view_own",       resource: "shipment",     action: "view_own", description: "Track own shipments" },
  { name: "shipment:receive",        resource: "shipment",     action: "receive",  description: "Mark shipment as received" },

  // ── RFQ — Supplier permissions ───────────────────────────────────────────────
  { name: "rfq:view_assigned",       resource: "rfq",          action: "view_assigned", description: "View RFQs assigned to this supplier (buyer identity hidden)" },
  { name: "rfq:negotiate",           resource: "rfq",          action: "negotiate", description: "Submit counter-quote on an assigned RFQ" },
  { name: "rfq:accept",              resource: "rfq",          action: "accept",   description: "Accept admin's offered price on an RFQ" },
  { name: "po:view_own",             resource: "po",           action: "view_own", description: "View purchase orders issued to this supplier" },
  { name: "po:confirm",              resource: "po",           action: "confirm",  description: "Confirm a purchase order" },
  { name: "po:upload_invoice",       resource: "po",           action: "upload_invoice", description: "Upload supplier invoice and e-way bill against a PO" },
  { name: "shipment:create",         resource: "shipment",     action: "create",   description: "Create a shipment record after dispatch" },

  // ── RFQ — Admin permissions ──────────────────────────────────────────────────
  { name: "rfq:view_all",            resource: "rfq",          action: "view_all", description: "View all RFQs across all buyers" },
  { name: "rfq:assign",              resource: "rfq",          action: "assign",   description: "Assign a supplier and set opening price for an RFQ" },
  { name: "rfq:finalize",            resource: "rfq",          action: "finalize", description: "Finalise negotiation and auto-generate PO + Invoice" },
  { name: "negotiation:respond",     resource: "negotiation",  action: "respond",  description: "Accept or counter a supplier's counter-quote" },
  { name: "po:view_all",             resource: "po",           action: "view_all", description: "View all purchase orders" },
  { name: "invoice:view_all",        resource: "invoice",      action: "view_all", description: "View all sales invoices" },
  { name: "shipment:checkpoint",     resource: "shipment",     action: "checkpoint", description: "Add a transit checkpoint to a shipment" },
  { name: "shipment:deliver",        resource: "shipment",     action: "deliver",  description: "Mark a shipment as delivered" },
  { name: "shipment:override_status",resource: "shipment",     action: "override_status", description: "Manually override shipment status" },
  { name: "admin:finance",           resource: "admin",        action: "finance",  description: "Access finance/settlement panel" },
];

// ─── Role → Permission Mappings ───────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    // Platform
    "users:read", "users:manage", "users:role", "profile:edit",
    "marketplace:access", "gst:verify", "admin:access",
    // All RFQ pipeline
    "rfq:submit", "rfq:view_own", "rfq:view_all",
    "rfq:assign", "rfq:finalize", "negotiation:respond",
    "po:view_own", "po:view_all", "po:confirm", "po:upload_invoice",
    "invoice:view_own", "invoice:view_all",
    "shipment:create", "shipment:view_own", "shipment:checkpoint",
    "shipment:deliver", "shipment:override_status", "shipment:receive",
    "admin:finance",
  ],

  supplier: [
    "profile:edit", "gst:verify",
    "rfq:view_assigned", "rfq:negotiate", "rfq:accept",
    "po:view_own", "po:confirm", "po:upload_invoice",
    "shipment:create",
  ],

  user: [
    // buyer
    "profile:edit", "marketplace:access", "gst:verify",
    "rfq:submit", "rfq:view_own",
    "invoice:view_own",
    "shipment:view_own", "shipment:receive",
  ],
};

// ─── Schema Bootstrap ─────────────────────────────────────────────────────────

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

// ─── Seed Entry Point ─────────────────────────────────────────────────────────

export async function seedRbac() {
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
  console.log(`  ✓ ${Object.keys(ROLE_PERMISSIONS).length} roles upserted (admin, supplier, user)`);

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
    await db.update(users).set({ role: "admin" }).where(eq(users.email, adminEmail));
    console.log(`  ✓ Existing user ${adminEmail} promoted to admin`);
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({
      gstNumber:            "ADMIN000000000000",
      email:                adminEmail,
      mobile:               "0000000000",
      username:             adminUsername,
      password:             hashedPassword,
      businessType:         "manufacturer",
      role:                 "admin",
      emailVerified:        true,
      mobileVerified:       true,
      isActive:             true,
      registrationComplete: true,
    });
    console.log(`  ✓ Admin account created: ${adminEmail} / ${adminPassword}`);
    console.log("  ⚠  Change the admin password immediately after first login!");
  }

  console.log("RBAC seeding complete.");
}

// Standalone entry point
if (require.main === module) {
  seedRbac()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
