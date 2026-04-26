import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../user/user.repository";
import { IUser, UserProfile, BusinessType } from "../user/user.entity";
import { env } from "../../config/env";
import { otpStore, generateOtp } from "./otp.store";
import { verifyGst } from "../gst/gst.service";
import { sendOtpEmail } from "../../services/email.service";
import { sendOtpSms } from "../../services/sms.service";
import { db } from "../../db";
import { otpTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { HttpException } from "../../core/HttpException";

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

function toSafeUser(user: IUser) {
  const { password, ...safe } = user;
  return safe;
}

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  // ─── GST Verification ──────────────────────────────────────────────────────
  async gstVerify(gstNumber: string) {
    return verifyGst(gstNumber);
  }

  // ─── Phone OTP ─────────────────────────────────────────────────────────────
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
    await db.insert(otpTable).values({ email, otp, expiresAt });
    await sendOtpEmail(email, otp);

    console.log("OTP sent successfully", otp);
  }

  async verifyEmailOtp(email: string, otp: string): Promise<string> {
    const record = await db.query.otpTable.findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.email, email), eq(table.otp, otp)),
    });

    if (!record) {
      throw new HttpException(400, "Invalid OTP. Please check and try again.");
    }
    if (record.isUsed) {
      throw new HttpException(400, "This OTP has already been used. Please request a new one.");
    }
    if (new Date() > record.expiresAt) {
      throw new HttpException(400, "OTP has expired. Please request a new one.");
    }

    await db
      .update(otpTable)
      .set({ isUsed: true })
      .where(eq(otpTable.id, record.id));

    return issueOtpToken(email);
  }

  // ─── Username Check ────────────────────────────────────────────────────────
  async checkUsername(username: string): Promise<{ available: boolean }> {
    if (username.length < 4) return { available: false };
    const existing = await this.userRepo.findByUsername(username);
    return { available: !existing };
  }

  // ─── Current User ───────────────────────────────────────────────────────────
  async me(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new HttpException(404, "User not found.");
    return toSafeUser(user);
  }

  // ─── Update Profile ─────────────────────────────────────────────────────────
  async updateProfile(userId: string, profile: UserProfile) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new HttpException(404, "User not found.");
    await this.userRepo.updateProfile(userId, profile);
    const updated = await this.userRepo.findById(userId);
    return toSafeUser(updated!);
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
    industries?: string[];
    materialTypes?: string[];
    machinesAvailable?: string;
    machineSpecs?: string;
    manufacturingProcesses?: string;
    productionCapacity?: string;
    supplyCapacity?: string;
    certifications?: string;
    existingClients?: string;
  }) {
    const verified = consumeOtpToken(data.otpToken);
    if (!verified) throw new HttpException(401, "OTP session expired. Please verify your email again.");
    if (verified.email !== data.email) throw new HttpException(400, "Email does not match the verified OTP session.");

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new HttpException(409, "An account with this email already exists.");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const profile: UserProfile = {
      industries: data.industries ?? [],
      materialTypes: data.materialTypes ?? [],
      machinesAvailable: data.machinesAvailable ?? "",
      machineSpecs: data.machineSpecs ?? "",
      manufacturingProcesses: data.manufacturingProcesses ?? "",
      productionCapacity: data.productionCapacity ?? "",
      supplyCapacity: data.supplyCapacity ?? "",
      certifications: data.certifications ?? "",
      existingClients: data.existingClients ?? "",
    };

    const user = await this.userRepo.create({
      gstNumber: data.gstNumber,
      email: data.email,
      mobile: data.mobile,
      username: data.username,
      password: hashedPassword,
      businessType: data.businessType,
      emailVerified: true,
      mobileVerified: false,
      profile,
    });

    return this.generateAuthResponse(user);
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(identifier: string, password: string) {
    const isEmail = identifier.includes("@");
    const user = isEmail
      ? await this.userRepo.findByEmail(identifier)
      : await this.userRepo.findByUsername(identifier);

    if (!user) throw new HttpException(401, "Invalid email/username or password.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new HttpException(401, "Invalid email/username or password.");

    if (!user.isActive) throw new HttpException(403, "Your account has been deactivated. Please contact support.");

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: IUser) {
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return { token, user: toSafeUser(user) };
  }
}
