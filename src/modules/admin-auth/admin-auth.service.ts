import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { adminInvitations } from "../../db/schema";
import { AdminUserRepository } from "./admin-user.repository";
import { IAdminUser } from "./admin-user.entity";
import { env } from "../../config/env";
import { HttpException } from "../../core/HttpException";
import { sendAdminInviteEmail, sendAdminApprovalEmail } from "../../services/email.service";

function toSafeAdmin(admin: IAdminUser) {
  const { password, ...safe } = admin;
  return safe;
}

export class AdminAuthService {
  constructor(private adminRepo: AdminUserRepository) {}

  // ─── Me ───────────────────────────────────────────────────────────────────
  async me(adminId: string) {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) throw new HttpException(404, "Admin not found.");
    return toSafeAdmin(admin);
  }

  // ─── Invite ────────────────────────────────────────────────────────────────
  async inviteAdmin(email: string, invitedByAdminId: string, frontendUrl: string) {
    const existing = await this.adminRepo.findByEmail(email);
    if (existing) throw new HttpException(409, "An admin with this email already exists.");

    const [active] = await db
      .select()
      .from(adminInvitations)
      .where(and(eq(adminInvitations.email, email), eq(adminInvitations.status, "pending")));

    if (active && active.expiresAt > new Date()) {
      throw new HttpException(409, "An active invitation has already been sent to this email.");
    }

    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await db.insert(adminInvitations).values({
      email,
      token,
      status: "pending",
      invitedBy: invitedByAdminId,
      expiresAt,
    });

    const inviteLink = `${frontendUrl}/admin-registration?token=${token}`;
    await sendAdminInviteEmail(email, inviteLink);

    return { message: `Invitation sent to ${email}.` };
  }

  // ─── Validate Invite Token ─────────────────────────────────────────────────
  async validateInviteToken(token: string) {
    const [invite] = await db
      .select()
      .from(adminInvitations)
      .where(and(eq(adminInvitations.token, token), eq(adminInvitations.status, "pending")));

    if (!invite) throw new HttpException(400, "Invalid or already used invitation token.");
    if (invite.expiresAt < new Date()) {
      await db.update(adminInvitations).set({ status: "expired" }).where(eq(adminInvitations.id, invite.id));
      throw new HttpException(400, "Invitation link has expired. Please request a new one.");
    }

    return { email: invite.email, valid: true };
  }

  // ─── Register via Invite ───────────────────────────────────────────────────
  async register(data: {
    token: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
  }) {
    const [invite] = await db
      .select()
      .from(adminInvitations)
      .where(and(eq(adminInvitations.token, data.token), eq(adminInvitations.status, "pending")));

    if (!invite) throw new HttpException(400, "Invalid or already used invitation token.");
    if (invite.expiresAt < new Date()) {
      await db.update(adminInvitations).set({ status: "expired" }).where(eq(adminInvitations.id, invite.id));
      throw new HttpException(400, "Invitation link has expired.");
    }

    const existingEmail = await this.adminRepo.findByEmail(invite.email);
    if (existingEmail) throw new HttpException(409, "An admin account with this email already exists.");

    const existingUsername = await this.adminRepo.findByUsername(data.username);
    if (existingUsername) throw new HttpException(409, "Username is already taken.");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const admin = await this.adminRepo.create({
      email: invite.email,
      username: data.username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: false,
    });

    await db.update(adminInvitations).set({ status: "accepted" }).where(eq(adminInvitations.id, invite.id));

    return {
      message: "Registration submitted. Your account is pending approval from an existing admin.",
      admin: toSafeAdmin(admin),
    };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(identifier: string, password: string) {
    const isEmail = identifier.includes("@");
    const admin = isEmail
      ? await this.adminRepo.findByEmail(identifier)
      : await this.adminRepo.findByUsername(identifier);

    if (!admin) throw new HttpException(401, "Invalid credentials.");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new HttpException(401, "Invalid credentials.");

    if (!admin.isActive)
      throw new HttpException(403, "Your account is pending approval or has been deactivated.");

    const token = jwt.sign({ adminId: admin.id, role: "admin" }, env.JWT_SECRET, { expiresIn: "1d" });
    return { token, admin: toSafeAdmin(admin) };
  }

  // ─── Pending Registrations ─────────────────────────────────────────────────
  async getPendingRegistrations() {
    const pending = await this.adminRepo.findPending();
    return pending.map(toSafeAdmin);
  }

  // ─── Approve Registration ──────────────────────────────────────────────────
  async approveRegistration(adminUserId: string) {
    const admin = await this.adminRepo.findById(adminUserId);
    if (!admin) throw new HttpException(404, "Admin user not found.");
    if (admin.isActive) throw new HttpException(400, "Account is already active.");

    await this.adminRepo.activate(adminUserId);
    await sendAdminApprovalEmail(admin.email);

    return { message: "Admin account approved and activated." };
  }
}
