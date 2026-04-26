import { randomUUID } from "crypto";
import { User, InsertUser } from "../db/schema";
import { IStorage } from "./IStorage";

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      gstNumber: user.gstNumber,
      email: user.email,
      mobile: user.mobile,
      username: user.username,
      password: user.password,
      businessType: user.businessType,
      role: user.role ?? "user",
      emailVerified: user.emailVerified ?? false,
      mobileVerified: user.mobileVerified ?? false,
      isActive: user.isActive ?? true,
      profile: user.profile ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }
}
