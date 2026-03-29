import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, User, InsertUser } from "../db/schema";
import { IStorage } from "./IStorage";

export class DrizzleStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return row;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [row] = await db.insert(users).values(user).returning();
    return row;
  }
}
