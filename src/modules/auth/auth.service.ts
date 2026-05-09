import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../user/user.repository';
import { IUser, UserProfile, BusinessType } from '../user/user.entity';
import { env } from '../../config/env';
import { otpStore, generateOtp } from './otp.store';
import { verifyGst } from '../gst/gst.service';
import { sendOtpEmail } from '../../services/email.service';
import { sendOtpSms } from '../../services/sms.service';
import { db } from '../../db';
import { otpTable, adminInvitations } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { HttpException } from '../../core/HttpException';

function issueOtpToken(email: string): string {
  return jwt.sign({ email, type: 'otp' }, env.JWT_SECRET, { expiresIn: '30m' });
}

export function consumeOtpToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    if (decoded.type !== 'otp') return null;
    return { email: decoded.email };
  } catch {
    return null;
  }
}

function toSafeUser(user: IUser) {
  const { password, ...safe } = user;
  return safe;
}

function normalizeCertifications(value?: string | string[]) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildLegacyProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    industries:
      profile.industries ??
      profile.industriesServed ??
      profile.manufacturerIndustries ??
      [],
    materialTypes: profile.materialTypes ?? [
      ...(profile.rawMaterialCategories ?? []),
      ...Object.values(profile.materialCategories ?? {}).flat(),
    ],
    manufacturingProcesses:
      profile.manufacturingProcesses ??
      (profile.manufacturingCapabilities ?? []).join(', '),
    targetIndustries:
      profile.targetIndustries ??
      profile.industriesServed ??
      profile.manufacturerIndustries ??
      [],
    rawMaterialProducts:
      profile.rawMaterialProducts ??
      Object.values(profile.materialCategories ?? {}).flat(),
  };
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
    otpStore.set('phone', mobile, otp);
    await sendOtpSms(mobile, otp);
  }

  async verifyPhoneOtp(mobile: string, otp: string): Promise<boolean> {
    return otpStore.verify('phone', mobile, otp);
  }

  // ─── Email OTP ─────────────────────────────────────────────────────────────
  async sendEmailOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.delete(otpTable).where(eq(otpTable.email, email));
    await db.insert(otpTable).values({ email, otp, expiresAt });
    await sendOtpEmail(email, otp);

    console.log('OTP sent successfully', otp);
  }

  async verifyEmailOtp(email: string, otp: string): Promise<string> {
    const record = await db.query.otpTable.findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.email, email), eq(table.otp, otp)),
    });

    if (!record) {
      throw new HttpException(400, 'Invalid OTP. Please check and try again.');
    }
    if (record.isUsed) {
      throw new HttpException(
        400,
        'This OTP has already been used. Please request a new one.',
      );
    }
    if (new Date() > record.expiresAt) {
      throw new HttpException(
        400,
        'OTP has expired. Please request a new one.',
      );
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
    if (!user) throw new HttpException(404, 'User not found.');
    return toSafeUser(user);
  }

  // ─── Complete Registration (contact / address step) ────────────────────────
  async completeRegistration(
    userId: string,
    input: {
      firstName: string;
      lastName: string;
      designation?: string;
      phone: string;
      addresses?: UserProfile["addresses"];
      yearEstablished?: string;
      totalEmployees?: string;
      website?: string;
      description?: string;
    }
  ) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new HttpException(404, "User not found.");

    const profile: UserProfile = buildLegacyProfile({
      ...(user.profile ?? {}),
      firstName: input.firstName,
      lastName: input.lastName,
      designation: input.designation ?? user.profile?.designation,
      phone: input.phone,
      addresses: input.addresses?.length ? input.addresses : user.profile?.addresses,
      yearEstablished: input.yearEstablished ?? user.profile?.yearEstablished,
      totalEmployees: input.totalEmployees ?? user.profile?.totalEmployees,
      website: input.website ?? user.profile?.website,
      description: input.description ?? user.profile?.description,
      profileComplete: true,
      wizardCompletedAt: new Date().toISOString(),
    });

    await this.userRepo.updateProfile(userId, profile, {
      registrationComplete: true,
      profileCompletedAt: new Date(),
    });

    const updated = await this.userRepo.findById(userId);
    if (!updated) throw new HttpException(404, "User not found.");
    return toSafeUser(updated);
  }

  // ─── Update Profile ─────────────────────────────────────────────────────────
  async updateProfile(userId: string, incoming: UserProfile) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new HttpException(404, 'User not found.');

    // Merge: existing profile ← new fields (new data wins on overlapping keys)
    const merged: UserProfile = buildLegacyProfile({
      ...(user.profile ?? {}),
      ...incoming,
    });

    await this.userRepo.updateProfile(userId, merged, {
      registrationComplete: merged.profileComplete === true
        ? true
        : (user.registrationComplete ?? false),
      profileCompletedAt: merged.profileComplete ? new Date() : (user.profileCompletedAt ?? null),
    });
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
    certifications?: string | string[];
    existingClients?: string;
  }) {
    const verified = consumeOtpToken(data.otpToken);
    if (!verified)
      throw new HttpException(
        401,
        'OTP session expired. Please verify your email again.',
      );
    if (verified.email !== data.email)
      throw new HttpException(
        400,
        'Email does not match the verified OTP session.',
      );

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing)
      throw new HttpException(
        409,
        'An account with this email already exists.',
      );

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const profile = buildLegacyProfile({
      industries: data.industries ?? [],
      materialTypes: data.materialTypes ?? [],
      machinesAvailable: data.machinesAvailable ?? '',
      machineSpecs: data.machineSpecs ?? '',
      manufacturingProcesses: data.manufacturingProcesses ?? '',
      productionCapacity: data.productionCapacity ?? '',
      supplyCapacity: data.supplyCapacity ?? '',
      certifications: normalizeCertifications(data.certifications),
      existingClients: data.existingClients ?? '',
    });

    const user = await this.userRepo.create({
      gstNumber: data.gstNumber,
      email: data.email,
      mobile: data.mobile,
      username: data.username,
      password: hashedPassword,
      businessType: data.businessType,
      emailVerified: true,
      mobileVerified: false,
      registrationComplete: false,
      profile,
    });

    return this.generateAuthResponse(user);
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(identifier: string, password: string) {
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await this.userRepo.findByEmail(identifier)
      : await this.userRepo.findByUsername(identifier);

    if (!user)
      throw new HttpException(401, 'Invalid email/username or password.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new HttpException(401, 'Invalid email/username or password.');

    if (!user.isActive)
      throw new HttpException(
        403,
        'Your account has been deactivated. Please contact support.',
      );

    return this.generateAuthResponse(user);
  }

  // ─── Validate Invite Token (public) ───────────────────────────────────────
  async validateInviteToken(token: string) {
    const [invite] = await db
      .select()
      .from(adminInvitations)
      .where(and(eq(adminInvitations.token, token), eq(adminInvitations.status, "pending")));

    if (!invite) throw new HttpException(400, 'Invalid or already used invitation token.');
    if (invite.expiresAt < new Date()) {
      await db
        .update(adminInvitations)
        .set({ status: 'expired' })
        .where(eq(adminInvitations.id, invite.id));
      throw new HttpException(400, 'Invitation link has expired. Please request a new one.');
    }

    return { email: invite.email, valid: true };
  }

  // ─── Admin Registration via Invite ────────────────────────────────────────
  async adminRegister(data: {
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

    if (!invite) throw new HttpException(400, 'Invalid or already used invitation token.');
    if (invite.expiresAt < new Date()) {
      await db.update(adminInvitations).set({ status: 'expired' }).where(eq(adminInvitations.id, invite.id));
      throw new HttpException(400, 'Invitation link has expired. Please request a new one.');
    }

    const existing = await this.userRepo.findByEmail(invite.email);
    if (existing) throw new HttpException(409, 'An account with this email already exists.');

    const usernameCheck = await this.userRepo.findByUsername(data.username);
    if (usernameCheck) throw new HttpException(409, 'Username is already taken.');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepo.create({
      email: invite.email,
      username: data.username,
      password: hashedPassword,
      role: 'admin',
      isActive: false, // requires approval from existing admin
      emailVerified: true,
      registrationComplete: false,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Mark invitation as accepted
    await db
      .update(adminInvitations)
      .set({ status: 'accepted' })
      .where(eq(adminInvitations.id, invite.id));

    return {
      message: 'Registration submitted. Your account is pending approval by an existing admin.',
      user: toSafeUser(user),
    };
  }

  // ─── Admin Login ───────────────────────────────────────────────────────────
  async adminLogin(identifier: string, password: string) {
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await this.userRepo.findByEmail(identifier)
      : await this.userRepo.findByUsername(identifier);

    if (!user) throw new HttpException(401, 'Invalid email/username or password.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new HttpException(401, 'Invalid email/username or password.');

    if (user.role !== 'admin') throw new HttpException(403, 'Access denied. Admin credentials required.');

    if (!user.isActive)
      throw new HttpException(403, 'Your admin account is pending approval or has been deactivated.');

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: IUser) {
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '1d' },
    );
    return { token, user: toSafeUser(user) };
  }
}
