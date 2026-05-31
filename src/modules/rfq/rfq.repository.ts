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

  async findBySupplier(supplierUserId: string) {
    return this.db
      .select({
        rfq: {
          id: rfqRequests.id,
          rfqNumber: rfqRequests.rfqNumber,
          productName: rfqRequests.productName,
          category: rfqRequests.category,
          quantity: rfqRequests.quantity,
          unit: rfqRequests.unit,
          deliveryLocation: rfqRequests.deliveryLocation,
          requiredBy: rfqRequests.requiredBy,
          specs: rfqRequests.specs,
          orderType: rfqRequests.orderType,
          status: rfqRequests.status,
          createdAt: rfqRequests.createdAt,
          updatedAt: rfqRequests.updatedAt,
        },
        assignment: rfqAssignments,
      })
      .from(rfqAssignments)
      .innerJoin(rfqRequests, eq(rfqRequests.id, rfqAssignments.rfqId))
      .where(eq(rfqAssignments.supplierUserId, supplierUserId))
      .orderBy(desc(rfqAssignments.createdAt));
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

  async upsertAssignment(input: {
    rfqId: string;
    supplierUserId: string;
    assignedBy: string;
    adminMarginPct: string;
    adminOfferedPrice?: string;
    internalNotes?: string;
  }) {
    const [assignment] = await this.db
      .insert(rfqAssignments)
      .values({
        rfqId: input.rfqId,
        supplierUserId: input.supplierUserId,
        assignedBy: input.assignedBy,
        adminMarginPct: input.adminMarginPct,
        adminOfferedPrice: input.adminOfferedPrice,
        internalNotes: input.internalNotes,
        finalAgreedPrice: null,
        finalizedAt: null,
        negotiationStatus: "PENDING_SUPPLIER",
      })
      .onConflictDoUpdate({
        target: rfqAssignments.rfqId,
        set: {
          supplierUserId: input.supplierUserId,
          assignedBy: input.assignedBy,
          adminMarginPct: input.adminMarginPct,
          adminOfferedPrice: input.adminOfferedPrice,
          internalNotes: input.internalNotes,
          finalAgreedPrice: null,
          finalizedAt: null,
          negotiationStatus: "PENDING_SUPPLIER",
          createdAt: new Date(),
        },
      })
      .returning();

    return assignment;
  }
}
