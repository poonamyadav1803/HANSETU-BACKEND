import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { userAddresses, InsertUserAddress } from "../../db/schema";

export class UserAddressRepository {
  findByUser(userId: string) {
    return db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId))
      .orderBy(desc(userAddresses.isDefault));
  }

  async findById(id: string, userId: string) {
    const [row] = await db
      .select()
      .from(userAddresses)
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
    return row ?? null;
  }

  async create(data: InsertUserAddress) {
    if (data.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, data.userId));
    }
    const [row] = await db.insert(userAddresses).values(data).returning();
    return row;
  }

  async setDefault(id: string, userId: string) {
    await db
      .update(userAddresses)
      .set({ isDefault: false })
      .where(eq(userAddresses.userId, userId));
    const [row] = await db
      .update(userAddresses)
      .set({ isDefault: true })
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
      .returning();
    return row ?? null;
  }

  async delete(id: string, userId: string) {
    await db
      .delete(userAddresses)
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
  }
}
