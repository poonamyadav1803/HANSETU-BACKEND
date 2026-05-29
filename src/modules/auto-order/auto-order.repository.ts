import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { autoOrders, InsertAutoOrder } from "../../db/schema";

export class AutoOrderRepository {
  findByUser(userId: string) {
    return db
      .select()
      .from(autoOrders)
      .where(eq(autoOrders.userId, userId))
      .orderBy(desc(autoOrders.createdAt));
  }

  async findById(id: string, userId: string) {
    const [row] = await db
      .select()
      .from(autoOrders)
      .where(eq(autoOrders.id, id));
    return row?.userId === userId ? row : null;
  }

  async create(data: InsertAutoOrder) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const [row] = await db
      .insert(autoOrders)
      .values({ ...data, orderNumber })
      .returning();
    return row;
  }
}
