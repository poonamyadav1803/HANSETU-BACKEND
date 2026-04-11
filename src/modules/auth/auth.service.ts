import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRepository } from "../user/user.repository";
import { BusinessType } from "../user/user.entity";
import { env } from "../../config/env";
import { otpStore, generateOtp } from "./otp.store";
import { verifyGst } from "../gst/gst.service";
import { sendOtpEmail } from "../../services/email.service";
import { sendOtpSms } from "../../services/sms.service";
import { db } from "../../db";
import { otpTable } from "../../db/schema";
import { eq, and } from "drizzle-orm";

// In-memory store for OTP verification tokens (issued after email OTP verified)
// token → { email, expiresAt }
const otpTokenStore = new Map<string, { email: string; expiresAt: number }>();
const OTP_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes to complete registration

function issueOtpToken(email: string): string {
  return jwt.sign(
    { email, type: "otp" },
    env.JWT_SECRET,
    { expiresIn: "30m" }
  );
}

export function consumeOtpToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    if (decoded.type !== "otp") return null;

    return { email: decoded.email };
  } catch {
    return null;
  }
}

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  // ─── GST Verification ──────────────────────────────────────────────────────
  async gstVerify(gstNumber: string) {
    return verifyGst(gstNumber);
  }

  // ─── Phone OTP ─────────────────────────────────────────────────────────────
  // Backend service is fully wired. Not called during registration flow
  // (frontend only validates phone format). Available for future use.
  async sendPhoneOtp(mobile: string): Promise<void> {
    const otp = generateOtp();
    otpStore.set("phone", mobile, otp);
    await sendOtpSms(mobile, otp);
  }

  async verifyPhoneOtp(mobile: string, otp: string): Promise<boolean> {
    return otpStore.verify("phone", mobile, otp);
  }

  // ─── Email OTP ─────────────────────────────────────────────────────────────
  async sendEmailOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.delete(otpTable).where(eq(otpTable.email, email));

    await db.insert(otpTable).values({
      email,
      otp,
      expiresAt,
    });

    await sendOtpEmail(email, otp);

    console.log("OTP sent successfully", otp);
  }

  async verifyEmailOtp(email: string, otp: string): Promise<string> {
    const record = await db.query.otpTable.findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.email, email), eq(table.otp, otp)),
    });

    if (!record) {
      throw new Error("Invalid OTP");
    }

    if (record.isUsed) {
      throw new Error("OTP already used");
    }

    if (new Date() > record.expiresAt) {
      throw new Error("OTP expired");
    }

    await db
      .update(otpTable)
      .set({ isUsed: true })
      .where(eq(otpTable.id, record.id));

    return issueOtpToken(email);
  }

  // ─── Signup ────────────────────────────────────────────────────────────────
  async signup(data: {
    gstNumber: string;
    email: string;
    mobile: string;
    username: string;
    password: string;
    businessType: BusinessType;
    otpToken: string;
  }) {
    // Validate OTP token (issued after email OTP verified)
    const verified = consumeOtpToken(data.otpToken);
    if (!verified) throw new Error("OTP session expired. Please verify your email again.");
    if (verified.email !== data.email) throw new Error("Email mismatch with verified OTP.");

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new Error("An account with this email already exists.");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepo.create({
      ...data,
      password: hashedPassword,
      emailVerified: true,
      mobileVerified: false, // phone not verified in current flow
    });

    return this.generateToken(user.id);
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "1d" });
  }
}
