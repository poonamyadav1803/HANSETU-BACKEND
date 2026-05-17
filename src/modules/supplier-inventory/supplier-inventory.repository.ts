import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { supplierInventory, InsertSupplierInventory } from "../../db/schema";

export class SupplierInventoryRepository {
  async findBySupplier(supplierUserId: string) {
    return db
      .select()
      .from(supplierInventory)
      .where(eq(supplierInventory.supplierUserId, supplierUserId))
      .orderBy(desc(supplierInventory.updatedAt));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(supplierInventory)
      .where(eq(supplierInventory.id, id));
    return row ?? null;
  }

  async create(data: InsertSupplierInventory) {
    const [row] = await db.insert(supplierInventory).values(data).returning();
    return row;
  }

  async update(
    id: string,
    data: Partial<Pick<InsertSupplierInventory, "materialName" | "category" | "quantity" | "price" | "status">>
  ) {
    const [row] = await db
      .update(supplierInventory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supplierInventory.id, id))
      .returning();
    return row;
  }

  async delete(id: string) {
    await db.delete(supplierInventory).where(eq(supplierInventory.id, id));
  }

  async countByStatus(supplierUserId: string, status: string) {
    const rows = await db
      .select({ id: supplierInventory.id })
      .from(supplierInventory)
      .where(
        and(
          eq(supplierInventory.supplierUserId, supplierUserId),
          eq(supplierInventory.status, status)
        )
      );
    return rows.length;
  }
}
