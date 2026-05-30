import { eq, desc, sql } from "drizzle-orm";
import { BaseRepository } from "../../core/BaseRepository";
import { rfqRequests, rfqAssignments, rfqNegotiations, users } from "../../db/schema";
import type { RfqStatus } from "../../core/order-state-machine";

export class RfqRepository extends BaseRepository {
  async generateRfqNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.db.execute(
      sql`SELECT COUNT(*)::int AS count FROM rfq_requests WHERE EXTRACT(YEAR FROM created_at) = ${year}`
    );
    const count = (result.rows[0] as { count: number }).count;
    const padded = String(count + 1).padStart(5, "0");
    return `RFQ/${year}/${padded}`;
  }

  async create(data: {
    rfqNumber: string;
    buyerId: string;
    productName: string;
    category: string;
    quantity: string;
    unit: string;
    deliveryLocation: string;
    requiredBy?: string;
    specs?: string;
    orderType: string;
    attachments: string[];
  }) {
    const [rfq] = await this.db
      .insert(rfqRequests)
      .values({ ...data, status: "SUBMITTED" })
      .returning();
    return rfq;
  }

  async findByBuyer(buyerId: string) {
    return this.db
      .select({
        rfq: rfqRequests,
        assignment: rfqAssignments,
      })
      .from(rfqRequests)
      .leftJoin(rfqAssignments, eq(rfqAssignments.rfqId, rfqRequests.id))
      .where(eq(rfqRequests.buyerId, buyerId))
      .orderBy(desc(rfqRequests.createdAt));
  }

  async findById(id: string) {
    const [row] = await this.db
      .select({
        rfq: rfqRequests,
        assignment: rfqAssignments,
      })
      .from(rfqRequests)
      .leftJoin(rfqAssignments, eq(rfqAssignments.rfqId, rfqRequests.id))
      .where(eq(rfqRequests.id, id));
    return row ?? null;
  }

  async findAll(status?: string) {
    const query = this.db
      .select({
        rfq: rfqRequests,
        assignment: rfqAssignments,
        buyer: {
          id: users.id,
          username: users.username,
          email: users.email,
          businessType: users.businessType,
        },
      })
      .from(rfqRequests)
      .leftJoin(rfqAssignments, eq(rfqAssignments.rfqId, rfqRequests.id))
      .leftJoin(users, eq(users.id, rfqRequests.buyerId))
      .orderBy(desc(rfqRequests.createdAt));

    if (status) {
      return query.where(eq(rfqRequests.status, status));
    }
    return query;
  }

  async updateStatus(id: string, status: RfqStatus) {
    const [updated] = await this.db
      .update(rfqRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(rfqRequests.id, id))
      .returning();
    return updated;
  }

  async getNegotiationHistory(rfqId: string) {
    return this.db
      .select()
      .from(rfqNegotiations)
      .where(eq(rfqNegotiations.rfqId, rfqId))
      .orderBy(rfqNegotiations.round);
  }
}
