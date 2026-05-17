import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { supplierTransactions, InsertSupplierTransaction } from "../../db/schema";

export class SupplierTransactionRepository {
  async findBySupplier(supplierUserId: string) {
    return db
      .select()
      .from(supplierTransactions)
      .where(eq(supplierTransactions.supplierUserId, supplierUserId))
      .orderBy(desc(supplierTransactions.transactionDate));
  }

  async create(data: InsertSupplierTransaction) {
    const [row] = await db.insert(supplierTransactions).values(data).returning();
    return row;
  }

  async countByStatus(supplierUserId: string, status: string) {
    const rows = await db
      .select({ id: supplierTransactions.id })
      .from(supplierTransactions)
      .where(
        and(
          eq(supplierTransactions.supplierUserId, supplierUserId),
          eq(supplierTransactions.status, status)
        )
      );
    return rows.length;
  }

  async countDistinctBuyers(supplierUserId: string) {
    const rows = await db
      .select({ buyerName: supplierTransactions.buyerName })
      .from(supplierTransactions)
      .where(eq(supplierTransactions.supplierUserId, supplierUserId));
    return new Set(rows.map((r) => r.buyerName)).size;
  }
}
