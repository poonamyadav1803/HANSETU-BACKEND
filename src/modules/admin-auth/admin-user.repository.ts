import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { adminUsers } from "../../db/schema";
import { IAdminUser } from "./admin-user.entity";

export class AdminUserRepository {
  async create(data: Omit<IAdminUser, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db
      .insert(adminUsers)
      .values({
        email: data.email,
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: data.isActive ?? false,
      })
      .returning();
    return this.mapRow(row);
  }

  async findByEmail(email: string) {
    const [row] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return row ? this.mapRow(row) : null;
  }

  async findByUsername(username: string) {
    const [row] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return row ? this.mapRow(row) : null;
  }

  async findById(id: string) {
    const [row] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return row ? this.mapRow(row) : null;
  }

  async findAll() {
    const rows = await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
    return rows.map((row) => this.mapRow(row));
  }

  async findPending() {
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.isActive, false))
      .orderBy(desc(adminUsers.createdAt));
    return rows.map((row) => this.mapRow(row));
  }

  async activate(id: string) {
    await db.update(adminUsers).set({ isActive: true, updatedAt: new Date() }).where(eq(adminUsers.id, id));
  }

  private mapRow(row: typeof adminUsers.$inferSelect): IAdminUser {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      password: row.password,
      firstName: row.firstName,
      lastName: row.lastName,
      isActive: row.isActive,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }
}
