import { BaseService } from "../../core/BaseService";
import { guardRfqTransition, type RfqStatus } from "../../core/order-state-machine";
import { OrderRepository } from "./order.repository";
import type {
  ConfirmOrderDto,
  ListOrdersQuery,
  RecordAdvancePaymentDto,
  UpdatePhase5DocumentsDto,
} from "./order.schema";

export class OrderService extends BaseService {
  constructor(private repo: OrderRepository) {
    super();
  }

  async confirmOrder(buyerId: string, dto: ConfirmOrderDto) {
    const source = await this.repo.findSourceByRfqId(dto.rfqId);
    if (!source) this.throwNotFound("RFQ not found");
    const confirmedSource = source!;

    if (confirmedSource.rfq.buyerId !== buyerId) {
      this.throwUnauthorized("You do not have access to this RFQ");
    }

    const existingOrder = await this.repo.findByRfqId(dto.rfqId);
    if (existingOrder) {
      this.throwBadRequest("An order has already been confirmed for this RFQ.");
    }

    const rfqStatus = confirmedSource.rfq.status as RfqStatus;
    if (rfqStatus !== "QUOTE_FINALIZED") {
      this.throwBadRequest("Order can only be confirmed after the quote or sample is finalized.");
    }

    const assignment = confirmedSource.assignment;
    if (!assignment) {
      this.throwBadRequest("Order cannot be confirmed before a supplier assignment exists.");
    }
    const confirmedAssignment = assignment!;

    if (!["FINALIZED", "SUPPLIER_ACCEPTED"].includes(confirmedAssignment.negotiationStatus)) {
      this.throwBadRequest("Order can only be confirmed from an accepted quote or sample.");
    }

    if (dto.sourceType === "SAMPLE" && confirmedSource.rfq.orderType !== "SAMPLE") {
      this.throwBadRequest("SAMPLE orders can only be confirmed from SAMPLE RFQs.");
    }

    guardRfqTransition(rfqStatus, "PO_RAISED");

    const orderNumber = await this.repo.generateOrderNumber();
    const totalAmount = confirmedAssignment.finalAgreedPrice ?? confirmedAssignment.negotiatedPrice ?? null;
    const advancePayment = dto.advancePayment;

    const order = await this.repo.create({
      orderNumber,
      buyerId,
      rfqId: dto.rfqId,
      assignmentId: confirmedAssignment.id,
      sourceType: dto.sourceType,
      status: "ORDER_CONFIRMED",
      totalAmount,
      advancePaymentAmount: advancePayment ? String(advancePayment.amount) : null,
      advancePaymentMethod: advancePayment?.method ?? null,
      advancePaymentReference: advancePayment?.reference ?? null,
      advancePaymentStatus: advancePayment ? "RECORDED" : "NOT_APPLICABLE",
      phase5DocumentStatus: "TRIGGERED",
      phase5DocumentGenerationTriggeredAt: new Date(),
      phase5Documents: [
        {
          phase: 5,
          status: "TRIGGERED",
          triggeredAt: new Date().toISOString(),
          source: "ORDER_CONFIRMATION",
        },
      ],
      notes: dto.notes ?? null,
    });

    await this.repo.updateRfqStatus(dto.rfqId, "PO_RAISED");

    return order;
  }

  async listBuyerOrders(buyerId: string, query: ListOrdersQuery) {
    return this.repo.list({ ...query, buyerId });
  }

  async listAdminOrders(query: ListOrdersQuery) {
    return this.repo.list(query);
  }

  async getBuyerOrder(id: string, buyerId: string) {
    const order = await this.repo.findById(id);
    if (!order) this.throwNotFound("Order not found");
    if (order!.order.buyerId !== buyerId) {
      this.throwUnauthorized("You do not have access to this order");
    }
    return order!;
  }

  async getAdminOrder(id: string) {
    const order = await this.repo.findById(id);
    if (!order) this.throwNotFound("Order not found");
    return order!;
  }

  async recordAdvancePayment(id: string, buyerId: string, dto: RecordAdvancePaymentDto) {
    await this.getBuyerOrder(id, buyerId);
    const order = await this.repo.updateAdvancePayment(id, dto);
    if (!order) this.throwNotFound("Order not found");
    return order!;
  }

  async updatePhase5Documents(id: string, dto: UpdatePhase5DocumentsDto) {
    const order = await this.repo.updatePhase5Documents(id, dto);
    if (!order) this.throwNotFound("Order not found");
    return order!;
  }
}
