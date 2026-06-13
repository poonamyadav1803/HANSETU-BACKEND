import { BaseService } from "../../core/BaseService";
import { guardRfqTransition, type RfqStatus } from "../../core/order-state-machine";
import {
  sendOrderAcknowledgementAdminNotification,
  sendOrderAcknowledgementNotification,
} from "../../services/email.service";
import { FileUploadService } from "../../services/file-upload.service";
import { OrderRepository } from "./order.repository";
import type {
  AcknowledgeOrderDto,
  ConfirmOrderDto,
  ListOrdersQuery,
  RecordAdvancePaymentDto,
  UpdatePhase5DocumentsDto,
} from "./order.schema";

export class OrderService extends BaseService {
  private fileUploadService = new FileUploadService();

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

  async listSupplierOrders(supplierUserId: string, query: ListOrdersQuery) {
    return this.repo.list({ ...query, supplierUserId });
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

  async getSupplierOrder(id: string, supplierUserId: string) {
    const order = await this.repo.findById(id);
    if (!order) this.throwNotFound("Order not found");
    if (!order!.assignment || order!.assignment.supplierUserId !== supplierUserId) {
      this.throwUnauthorized("You do not have access to this order");
    }
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

  async acknowledgeOrder(
    id: string,
    supplierUserId: string,
    dto: AcknowledgeOrderDto,
    files: Express.Multer.File[] = []
  ) {
    const orderContext = await this.getSupplierOrder(id, supplierUserId);

    if (orderContext.order.status !== "ORDER_CONFIRMED") {
      this.throwBadRequest(`Order cannot be acknowledged while in status ${orderContext.order.status}.`);
    }

    const expectedDispatchDate = new Date(dto.expectedDispatchDate);
    if (Number.isNaN(expectedDispatchDate.getTime())) {
      this.throwBadRequest("Expected dispatch date must be a valid date.");
    }

    const certificateFiles = await this.fileUploadService.uploadMany(files, {
      folder: `orders/${id}/supplier-certificates`,
    });

    const order = await this.repo.acknowledge(
      id,
      {
        ...dto,
        expectedDispatchDate: expectedDispatchDate.toISOString().slice(0, 10),
      },
      certificateFiles
    );
    if (!order) this.throwNotFound("Order not found");

    const notification = {
      orderNumber: order!.orderNumber,
      rfqNumber: orderContext.rfq?.rfqNumber,
      productName: orderContext.rfq?.productName,
      expectedDispatchDate: order!.expectedDispatchDate ?? dto.expectedDispatchDate,
    };

    if (orderContext.buyer?.email) {
      sendOrderAcknowledgementNotification({
        ...notification,
        buyerEmail: orderContext.buyer.email,
      }).catch(() => undefined);
    }

    sendOrderAcknowledgementAdminNotification(notification).catch(() => undefined);

    return order!;
  }
}
