import { and, desc, eq, gte, ilike, lte, sql, type SQL } from "drizzle-orm";
import { BaseRepository } from "../../core/BaseRepository";
import { orders, rfqAssignments, rfqRequests, shipments, users } from "../../db/schema";
import type { RfqStatus } from "../../core/order-state-machine";
import type {
  AcknowledgeOrderDto,
  CreateShipmentDto,
  ListOrdersQuery,
  RecordAdvancePaymentDto,
  UpdatePhase5DocumentsDto,
} from "./order.schema";
import type { UploadedFile } from "../../services/file-upload.service";

export class OrderRepository extends BaseRepository {
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.db.execute(
      sql`SELECT COUNT(*)::int AS count FROM orders WHERE EXTRACT(YEAR FROM created_at) = ${year}`
    );
    const count = (result.rows[0] as { count: number }).count;
    return `ORD/${year}/${String(count + 1).padStart(5, "0")}`;
  }

  async generateShipmentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.db.execute(
      sql`SELECT COUNT(*)::int AS count FROM shipments WHERE EXTRACT(YEAR FROM created_at) = ${year}`
    );
    const count = (result.rows[0] as { count: number }).count;
    return `SHP/${year}/${String(count + 1).padStart(5, "0")}`;
  }

  async findSourceByRfqId(rfqId: string) {
    const [row] = await this.db
      .select({
        rfq: rfqRequests,
        assignment: rfqAssignments,
      })
      .from(rfqRequests)
      .leftJoin(rfqAssignments, eq(rfqAssignments.rfqId, rfqRequests.id))
      .where(eq(rfqRequests.id, rfqId));

    return row ?? null;
  }

  async findByRfqId(rfqId: string) {
    const [row] = await this.db.select().from(orders).where(eq(orders.rfqId, rfqId));
    return row ?? null;
  }

  async findById(id: string) {
    const [row] = await this.db
      .select({
        order: orders,
        rfq: rfqRequests,
        assignment: rfqAssignments,
        buyer: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
      })
      .from(orders)
      .leftJoin(rfqRequests, eq(rfqRequests.id, orders.rfqId))
      .leftJoin(rfqAssignments, eq(rfqAssignments.id, orders.assignmentId))
      .leftJoin(users, eq(users.id, orders.buyerId))
      .where(eq(orders.id, id));

    return row ?? null;
  }

  async findShipmentByOrderId(orderId: string) {
    const [row] = await this.db.select().from(shipments).where(eq(shipments.orderId, orderId));
    return row ?? null;
  }

  async list(filters: ListOrdersQuery & { buyerId?: string }) {
    const conditions = this.buildFilters(filters);
    const where = conditions.length ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.limit;

    const rows = await this.db
      .select({
        order: orders,
        rfq: {
          id: rfqRequests.id,
          rfqNumber: rfqRequests.rfqNumber,
          productName: rfqRequests.productName,
          category: rfqRequests.category,
          quantity: rfqRequests.quantity,
          unit: rfqRequests.unit,
          orderType: rfqRequests.orderType,
          status: rfqRequests.status,
        },
        assignment: rfqAssignments,
      })
      .from(orders)
      .leftJoin(rfqRequests, eq(rfqRequests.id, orders.rfqId))
      .leftJoin(rfqAssignments, eq(rfqAssignments.id, orders.assignmentId))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(filters.limit)
      .offset(offset);

    const [countRow] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .leftJoin(rfqRequests, eq(rfqRequests.id, orders.rfqId))
      .leftJoin(rfqAssignments, eq(rfqAssignments.id, orders.assignmentId))
      .where(where);

    return {
      data: rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: countRow?.count ?? 0,
      },
    };
  }

  async create(data: typeof orders.$inferInsert) {
    const [order] = await this.db.insert(orders).values(data).returning();
    return order;
  }

  async updateAdvancePayment(id: string, dto: RecordAdvancePaymentDto) {
    const [order] = await this.db
      .update(orders)
      .set({
        advancePaymentAmount: String(dto.amount),
        advancePaymentMethod: dto.method,
        advancePaymentReference: dto.reference ?? null,
        advancePaymentStatus: dto.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return order ?? null;
  }

  async updatePhase5Documents(id: string, dto: UpdatePhase5DocumentsDto) {
    const [order] = await this.db
      .update(orders)
      .set({
        phase5DocumentStatus: dto.status,
        phase5Documents: dto.documents,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return order ?? null;
  }

  async acknowledge(id: string, dto: AcknowledgeOrderDto, certificateFiles: UploadedFile[]) {
    const [order] = await this.db
      .update(orders)
      .set({
        status: "SUPPLIER_ACKNOWLEDGED",
        supplierAcknowledgedAt: new Date(),
        expectedDispatchDate: dto.expectedDispatchDate,
        supplierCertificateFiles: certificateFiles,
        supplierAcknowledgementNotes: dto.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return order ?? null;
  }

  async createShipment(input: {
    orderId: string;
    rfqId: string;
    buyerId: string;
    supplierUserId: string;
    shipmentNumber: string;
    dto: CreateShipmentDto;
    dispatchedAt: Date;
  }) {
    return this.db.transaction(async (tx) => {
      const [shipment] = await tx
        .insert(shipments)
        .values({
          shipmentNumber: input.shipmentNumber,
          orderId: input.orderId,
          buyerId: input.buyerId,
          supplierUserId: input.supplierUserId,
          status: "DISPATCHED",
          carrierName: input.dto.carrierName ?? null,
          trackingNumber: input.dto.trackingNumber ?? null,
          vehicleNumber: input.dto.vehicleNumber ?? null,
          ewayBillNumber: input.dto.ewayBillNumber ?? null,
          ewayBillDocumentUrl: input.dto.ewayBillDocumentUrl ?? null,
          dispatchedAt: input.dispatchedAt,
          notes: input.dto.notes ?? null,
        })
        .returning();

      const [order] = await tx
        .update(orders)
        .set({
          status: "DISPATCHED",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId))
        .returning();

      const [rfq] = await tx
        .update(rfqRequests)
        .set({
          status: "DISPATCHED",
          updatedAt: new Date(),
        })
        .where(eq(rfqRequests.id, input.rfqId))
        .returning();

      return { shipment, order, rfq };
    });
  }

  async updateRfqStatus(rfqId: string, status: RfqStatus) {
    const [rfq] = await this.db
      .update(rfqRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(rfqRequests.id, rfqId))
      .returning();

    return rfq;
  }

  private buildFilters(filters: ListOrdersQuery & { buyerId?: string }) {
    const conditions: SQL[] = [];

    if (filters.buyerId) conditions.push(eq(orders.buyerId, filters.buyerId));
    if (filters.supplierUserId) conditions.push(eq(rfqAssignments.supplierUserId, filters.supplierUserId));
    if (filters.status) conditions.push(eq(orders.status, filters.status));
    if (filters.sourceType) conditions.push(eq(orders.sourceType, filters.sourceType));
    if (filters.advancePaymentStatus) {
      conditions.push(eq(orders.advancePaymentStatus, filters.advancePaymentStatus));
    }
    if (filters.phase5DocumentStatus) {
      conditions.push(eq(orders.phase5DocumentStatus, filters.phase5DocumentStatus));
    }
    if (filters.rfqId) conditions.push(eq(orders.rfqId, filters.rfqId));
    if (filters.orderNumber) conditions.push(ilike(orders.orderNumber, `%${filters.orderNumber}%`));
    if (filters.dateFrom) conditions.push(gte(orders.createdAt, new Date(filters.dateFrom)));
    if (filters.dateTo) conditions.push(lte(orders.createdAt, new Date(filters.dateTo)));

    return conditions;
  }
}
