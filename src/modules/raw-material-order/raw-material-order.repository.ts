import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { rawMaterialOrders, InsertRawMaterialOrder } from "../../db/schema";

export class RawMaterialOrderRepository {
  async findByManufacturer(manufacturerUserId: string) {
    return db
      .select()
      .from(rawMaterialOrders)
      .where(eq(rawMaterialOrders.manufacturerUserId, manufacturerUserId))
      .orderBy(desc(rawMaterialOrders.createdAt));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(rawMaterialOrders)
      .where(eq(rawMaterialOrders.id, id));
    return row ?? null;
  }

  async create(data: InsertRawMaterialOrder) {
    const [row] = await db.insert(rawMaterialOrders).values(data).returning();
    return row;
  }

  async updateStatus(id: string, status: string, problemDescription?: string) {
    const [row] = await db
      .update(rawMaterialOrders)
      .set({ status, problemDescription: problemDescription ?? null, updatedAt: new Date() })
      .where(eq(rawMaterialOrders.id, id))
      .returning();
    return row;
  }
}
