import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { IUser, UserProfile, BusinessType, UserRole } from "./user.entity";

export class UserRepository {
  async create(data: Partial<IUser>) {
    const [row] = await db
      .insert(users)
      .values({
        gstNumber: data.gstNumber!,
        email: data.email!,
        mobile: data.mobile!,
        username: data.username!,
        password: data.password!,
        businessType: data.businessType!,
        role: data.role ?? "user",
        emailVerified: data.emailVerified ?? false,
        mobileVerified: data.mobileVerified ?? false,
        isActive: data.isActive ?? true,
        profile: data.profile ?? null,
      })
      .returning();

    return this.mapRow(row);
  }

  async findByEmail(email: string) {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    return row ? this.mapRow(row) : null;
  }

  async findById(id: string) {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row ? this.mapRow(row) : null;
  }

  async findByUsername(username: string) {
    const [row] = await db.select().from(users).where(eq(users.username, username));
    return row ? this.mapRow(row) : null;
  }

  async findAll() {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    return rows.map((row) => this.mapRow(row));
  }

  async deactivateUser(id: string) {
    await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, id));
  }

  async activateUser(id: string) {
    await db.update(users).set({ isActive: true, updatedAt: new Date() }).where(eq(users.id, id));
  }

  async updateProfile(id: string, profile: UserProfile) {
    await db.update(users).set({ profile, updatedAt: new Date() }).where(eq(users.id, id));
  }

  async updateRole(id: string, role: UserRole) {
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
  }

  private mapRow(row: typeof users.$inferSelect): IUser {
    return {
      id: row.id,
      gstNumber: row.gstNumber,
      email: row.email,
      mobile: row.mobile,
      username: row.username,
      password: row.password,
      businessType: row.businessType as BusinessType,
      role: (row.role as UserRole) ?? "user",
      emailVerified: row.emailVerified ?? false,
      mobileVerified: row.mobileVerified ?? false,
      isActive: row.isActive ?? true,
      profile: (row.profile as UserProfile | null) ?? null,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }
}
