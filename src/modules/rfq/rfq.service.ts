import { HttpException } from "../../core/HttpException";
import { FileUploadService } from "../../services/file-upload.service";
import * as razorpayService from "../../services/razorpay.service";
import { db } from "../../db";
import { shipments, purchaseOrders, mfrProducts, mfrCategories, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import type {
  SubmitRfqDto, AssignDto, ApproveRfqDto, SubmitQuoteDto,
  ConfirmPoDto, UploadInvoiceDto, CreateShipmentDto, AddCheckpointDto,
} from "./rfq.schema";
import * as repo from "./rfq.repository";

const fileUpload = new FileUploadService();

// ─── Buyer: submit RFQ ────────────────────────────────────────────────────────

export async function submitRfq(
  buyerId: string,
  dto: SubmitRfqDto,
  files: Express.Multer.File[] = [],
) {
  if (dto.requestType === "COMPONENT_MANUFACTURER" && files.length === 0) {
    throw new HttpException(400, "At least one attachment is required for component specification");
  }

  let finalProductName = dto.productName ?? "";
  let finalCategory = dto.category ?? "";
  let finalSpecs = dto.specs;

  if (dto.requestType === "PRODUCT_CATALOGUE" && dto.mfrProductId) {
    const [product] = await db
      .select({ name: mfrProducts.name, categoryId: mfrProducts.categoryId, description: mfrProducts.description })
      .from(mfrProducts)
      .where(eq(mfrProducts.id, dto.mfrProductId));

    if (!product) throw new HttpException(404, "Product not found in catalogue");

    const [cat] = await db
      .select({ name: mfrCategories.name })
      .from(mfrCategories)
      .where(eq(mfrCategories.id, product.categoryId));

    finalProductName = product.name;
    finalCategory = cat?.name ?? product.categoryId;
    finalSpecs = product.description ?? undefined;
  }

  const rfqNumber = await repo.generateRfqNumber();

  let attachmentUrls: string[] = [];
  if (files.length > 0) {
    const uploaded = await fileUpload.uploadMany(files, { folder: `rfq/${rfqNumber}` });
    attachmentUrls = uploaded.map((u) => u.url);
  }

  return repo.createRfqRequest({
    rfqNumber,
    buyerId,
    productName: finalProductName,
    category: finalCategory,
    quantity: dto.quantity,
    unit: dto.unit,
    deliveryLocation: dto.deliveryLocation,
    requiredBy: dto.requiredBy,
    specs: finalSpecs,
    orderType: dto.orderType,
    requestType: dto.requestType,
    attachments: attachmentUrls,
  });
}

// ─── Buyer: get own RFQs ──────────────────────────────────────────────────────

export async function getMyRfqs(buyerId: string) {
  return repo.getRfqsByBuyer(buyerId);
}

export async function getMyRfqById(rfqId: string, buyerId: string) {
  const row = await repo.getRfqById(rfqId);
  if (!row) throw new HttpException(404, "RFQ not found");
  if (row.rfq.buyerId !== buyerId) throw new HttpException(403, "Access denied");
  const shipment = await repo.getShipmentByRfqId(rfqId);
  return { ...row, shipment };
}

// ─── Admin: list + detail ─────────────────────────────────────────────────────

export async function adminListRfqs(status?: string) {
  return repo.adminGetAllRfqs(status);
}

export async function adminGetOne(rfqId: string) {
  const row = await repo.adminGetRfqById(rfqId);
  if (!row) throw new HttpException(404, "RFQ not found");
  const shipment = await repo.getShipmentByRfqId(rfqId);
  return { ...row, shipment };
}

// ─── Admin: assignees list filtered by type ───────────────────────────────────

export async function getAssigneesList(
  type: "supplier" | "manufacturer",
  filters?: { state?: string; category?: string; verified?: boolean },
) {
  return repo.getAssigneesByType(type, filters);
}

export async function getAssigneeProfile(userId: string) {
  const row = await repo.getAssigneeById(userId);
  if (!row) throw new HttpException(404, "User not found");
  return row;
}

// ─── Admin Step A: assign supplier/manufacturer ───────────────────────────────

export async function adminAssign(rfqId: string, adminId: string, dto: AssignDto) {
  const rfq = await repo.getRfqById(rfqId);
  if (!rfq) throw new HttpException(404, "RFQ not found");

  if (!["SUBMITTED", "UNDER_REVIEW"].includes(rfq.rfq.status)) {
    throw new HttpException(400, `Cannot assign: RFQ status is ${rfq.rfq.status}`);
  }

  await repo.createOrUpdateAssignment({
    rfqId,
    assigneeUserId: dto.assigneeUserId,
    assignedBy: adminId,
    assignmentMode: dto.assignmentMode,
    negotiatedPrice: dto.negotiatedPrice,
    adminMarginPct: dto.adminMarginPct,
    transportCompany: dto.transportCompany,
    deliveryCharge: dto.deliveryCharge,
    internalNotes: dto.internalNotes,
  });

  await repo.updateRfqStatus(rfqId, "UNDER_REVIEW");
  return repo.adminGetRfqById(rfqId);
}

// ─── Admin Step B: approve → auto-create PO + Sales Invoice ──────────────────

export async function adminApprove(rfqId: string, dto: ApproveRfqDto) {
  const rfq = await repo.getRfqById(rfqId);
  if (!rfq) throw new HttpException(404, "RFQ not found");

  if (rfq.rfq.status !== "UNDER_REVIEW") {
    throw new HttpException(400, `Cannot approve: RFQ status is ${rfq.rfq.status}`);
  }

  const assignment = await repo.getAssignment(rfqId);
  if (!assignment) throw new HttpException(400, "No supplier assigned to this RFQ");
  if (!["PENDING", "SUPPLIER_QUOTED"].includes(assignment.negotiationStatus)) {
    throw new HttpException(400, "Assignment already approved");
  }

  // Use supplier's quoted price as the base if admin has not set one
  const negotiatedPrice = parseFloat(
    assignment.negotiatedPrice ?? assignment.supplierQuotedPrice ?? "0"
  );
  const marginPct = parseFloat(assignment.adminMarginPct ?? "10");
  const deliveryCharge = parseFloat(assignment.deliveryCharge ?? "0");

  if (negotiatedPrice <= 0) {
    throw new HttpException(400, "Negotiated price must be set before approving");
  }

  // PO: platform → supplier (no margin shown)
  const poBase = negotiatedPrice;
  const poGst = parseFloat((poBase * 0.18).toFixed(2));
  const poTotal = parseFloat((poBase + poGst).toFixed(2));

  // Sales Invoice: platform → buyer (includes margin)
  const marginAmt = parseFloat((negotiatedPrice * (marginPct / 100)).toFixed(2));
  const invBase = parseFloat((negotiatedPrice + marginAmt + deliveryCharge).toFixed(2));
  const invGst = parseFloat((invBase * 0.18).toFixed(2));
  const invTotal = parseFloat((invBase + invGst).toFixed(2));

  const [poNumber, invNumber] = await Promise.all([
    repo.generatePoNumber(),
    repo.generateInvoiceNumber(),
  ]);

  const po = await repo.createPurchaseOrder({
    poNumber,
    rfqId,
    supplierUserId: assignment.supplierUserId,
    buyerUserId: rfq.rfq.buyerId,
    productName: rfq.rfq.productName,
    quantity: parseFloat(rfq.rfq.quantity),
    unit: rfq.rfq.unit,
    baseAmount: poBase,
    gstAmount: poGst,
    totalAmount: poTotal,
    hsnCode: dto.hsnCode ?? "7208",
    deliveryLocation: rfq.rfq.deliveryLocation,
  });

  await repo.createSalesInvoice({
    invoiceNumber: invNumber,
    rfqId,
    poId: po.id,
    buyerUserId: rfq.rfq.buyerId,
    productName: rfq.rfq.productName,
    quantity: parseFloat(rfq.rfq.quantity),
    unit: rfq.rfq.unit,
    baseAmount: invBase,
    marginAmount: marginAmt,
    gstAmount: invGst,
    totalAmount: invTotal,
    hsnCode: dto.hsnCode ?? "7208",
    deliveryLocation: rfq.rfq.deliveryLocation,
  });

  await repo.approveAssignment(rfqId, negotiatedPrice);
  await repo.updateRfqStatus(rfqId, "PO_RAISED");

  return repo.adminGetRfqById(rfqId);
}

// ─── Supplier: get assigned RFQs (before PO is created) ─────────────────────

export async function getMyAssignedRfqs(supplierUserId: string) {
  return repo.getAssignedRfqsBySupplier(supplierUserId);
}

// ─── Supplier: submit quote (Story 3.3) ──────────────────────────────────────

export async function supplierSubmitQuote(rfqId: string, supplierUserId: string, dto: SubmitQuoteDto) {
  const assignment = await repo.getAssignment(rfqId);
  if (!assignment) throw new HttpException(404, "RFQ not assigned");
  if (assignment.supplierUserId !== supplierUserId) throw new HttpException(403, "Access denied");
  if (assignment.negotiationStatus !== "PENDING") {
    throw new HttpException(400, `Cannot submit quote: status is ${assignment.negotiationStatus}`);
  }

  await repo.submitSupplierQuote(rfqId, {
    supplierQuotedPrice: dto.unitPrice,
    supplierLeadTimeDays: dto.leadTimeDays,
    supplierMoq: dto.moqQuantity,
    quoteValidityDate: dto.quoteValidityDate,
    supplierNotes: dto.notes,
  });
}

// ─── Supplier: get assigned POs ───────────────────────────────────────────────

export async function getMyPos(supplierUserId: string) {
  return repo.getPosBySupplier(supplierUserId);
}

// ─── Step 4: Supplier confirms PO ─────────────────────────────────────────────

export async function confirmPo(poId: string, supplierUserId: string, dto: ConfirmPoDto) {
  const po = await repo.getPoById(poId);
  if (!po) throw new HttpException(404, "Purchase order not found");
  if (po.supplierUserId !== supplierUserId) throw new HttpException(403, "Access denied");
  if (po.status !== "ISSUED") throw new HttpException(400, `PO is already ${po.status}`);

  await repo.confirmPo(poId, dto.expectedDispatchDate);
}

// ─── Step 5: Supplier uploads invoice + e-way bill ────────────────────────────

export async function uploadSupplierInvoice(poId: string, supplierUserId: string, dto: UploadInvoiceDto) {
  const po = await repo.getPoById(poId);
  if (!po) throw new HttpException(404, "Purchase order not found");
  if (po.supplierUserId !== supplierUserId) throw new HttpException(403, "Access denied");
  if (po.status !== "CONFIRMED") throw new HttpException(400, "Confirm the PO before uploading invoice");

  await repo.uploadSupplierInvoice(poId, {
    supplierInvoiceNo: dto.supplierInvoiceNo,
    supplierInvoiceAmount: dto.supplierInvoiceAmount,
    ewayBillNo: dto.ewayBillNo,
  });
}

// ─── Step 6: Supplier creates shipment ───────────────────────────────────────

export async function createShipment(poId: string, supplierUserId: string, dto: CreateShipmentDto) {
  const po = await repo.getPoById(poId);
  if (!po) throw new HttpException(404, "Purchase order not found");
  if (po.supplierUserId !== supplierUserId) throw new HttpException(403, "Access denied");
  if (po.status !== "INVOICE_UPLOADED") throw new HttpException(400, "Upload your invoice before creating shipment");

  const existing = await repo.getShipmentByRfqId(po.rfqId);
  if (existing) throw new HttpException(400, "Shipment already created for this order");

  const shipmentNumber = await repo.generateShipmentNumber();

  const shipment = await repo.createShipment({
    shipmentNumber,
    poId,
    rfqId: po.rfqId,
    buyerId: po.buyerUserId,
    supplierId: supplierUserId,
    transporterName: dto.transporterName,
    docketNumber: dto.docketNumber,
    dispatchDate: dto.dispatchDate,
    ewayBillNo: dto.ewayBillNo,
  });

  // Mark PO dispatched and RFQ dispatched
  await db.update(purchaseOrders).set({ status: "DISPATCHED", updatedAt: new Date() }).where(eq(purchaseOrders.id, poId));
  await repo.updateRfqStatus(po.rfqId, "DISPATCHED");

  return shipment;
}

// ─── Step 7: Admin adds checkpoint ───────────────────────────────────────────

export async function adminAddCheckpoint(shipmentId: string, dto: AddCheckpointDto) {
  await repo.addCheckpoint(shipmentId, {
    label: dto.label,
    location: dto.location,
    note: dto.note,
  });
}

// ─── Step 8: Admin marks delivered ───────────────────────────────────────────

export async function adminMarkDelivered(shipmentId: string) {
  await repo.markShipmentDelivered(shipmentId);
  const [shipment] = await db.select().from(shipments).where(eq(shipments.id, shipmentId));
  if (shipment) {
    await repo.updateRfqStatus(shipment.rfqId, "DELIVERED");
    await db.update(purchaseOrders)
      .set({ status: "DELIVERED", updatedAt: new Date() })
      .where(eq(purchaseOrders.rfqId, shipment.rfqId));
  }
}

// ─── Step 9: Buyer marks received ────────────────────────────────────────────

export async function buyerMarkReceived(shipmentId: string, buyerId: string) {
  const [shipment] = await db.select().from(shipments).where(eq(shipments.id, shipmentId));
  if (!shipment) throw new HttpException(404, "Shipment not found");
  if (shipment.buyerId !== buyerId) throw new HttpException(403, "Access denied");
  if (shipment.status !== "DELIVERED") throw new HttpException(400, "Order has not been marked delivered yet");

  await repo.markShipmentReceived(shipmentId);
  await repo.updateRfqStatus(shipment.rfqId, "CLOSED");
  await db.update(purchaseOrders)
    .set({ status: "CLOSED", updatedAt: new Date() })
    .where(eq(purchaseOrders.rfqId, shipment.rfqId));
}

// ─── Admin: all shipments ─────────────────────────────────────────────────────

export async function adminListShipments() {
  return repo.adminGetAllShipments();
}

// ─── Payment: buyer creates Razorpay order ────────────────────────────────────

export async function createRazorpayOrder(invoiceId: string, buyerId: string) {
  const invoice = await repo.getInvoiceById(invoiceId);
  if (!invoice) throw new HttpException(404, "Invoice not found");
  if (invoice.buyerUserId !== buyerId) throw new HttpException(403, "Access denied");
  if (invoice.status === "PAID") throw new HttpException(400, "Invoice is already paid");
  if (invoice.status === "CANCELLED") throw new HttpException(400, "Invoice has been cancelled");

  const amountInPaise = Math.round(parseFloat(invoice.totalAmount) * 100);

  const order = await razorpayService.createOrder({
    amountInPaise,
    receipt: invoice.invoiceNumber,
    notes: { invoiceId, invoiceNumber: invoice.invoiceNumber },
  });

  await repo.setInvoiceAwaitingPayment(invoiceId, order.id);

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    invoiceNumber: invoice.invoiceNumber,
    productName: invoice.productName,
  };
}

// ─── Payment: buyer verifies Razorpay payment ────────────────────────────────

export async function verifyRazorpayPayment(
  invoiceId: string,
  buyerId: string,
  dto: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
) {
  const invoice = await repo.getInvoiceById(invoiceId);
  if (!invoice) throw new HttpException(404, "Invoice not found");
  if (invoice.buyerUserId !== buyerId) throw new HttpException(403, "Access denied");
  if (invoice.status === "PAID") throw new HttpException(400, "Invoice is already paid");

  const valid = razorpayService.verifyPaymentSignature({
    razorpayOrderId: dto.razorpayOrderId,
    razorpayPaymentId: dto.razorpayPaymentId,
    razorpaySignature: dto.razorpaySignature,
  });
  if (!valid) throw new HttpException(400, "Payment verification failed — signature mismatch");

  await repo.markInvoicePaid(invoiceId, dto.razorpayPaymentId, dto.razorpayOrderId);
}

// ─── Payment: admin manual mark-paid ─────────────────────────────────────────

export async function adminMarkInvoicePaid(invoiceId: string) {
  const invoice = await repo.getInvoiceById(invoiceId);
  if (!invoice) throw new HttpException(404, "Invoice not found");
  if (invoice.status === "PAID") throw new HttpException(400, "Invoice is already paid");

  await repo.adminMarkInvoicePaidManually(invoiceId);
}

// ─── Payment: admin releases payment to supplier ──────────────────────────────

export async function adminReleasePayment(poId: string) {
  const po = await repo.getPoById(poId);
  if (!po) throw new HttpException(404, "Purchase order not found");
  if (po.paymentReleased) throw new HttpException(400, "Payment has already been released");
  if (!["DELIVERED", "CLOSED"].includes(po.status)) {
    throw new HttpException(400, "Payment can only be released after delivery is confirmed");
  }

  await repo.markPoPaymentReleased(poId);
}

// ─── Payment Audit ────────────────────────────────────────────────────────────

export async function getAdminPaymentAudit() {
  return repo.getAdminPaymentAudit();
}

export async function getBuyerPaymentHistory(buyerUserId: string) {
  return repo.getBuyerPaymentHistory(buyerUserId);
}

export async function getSupplierPaymentHistory(supplierUserId: string) {
  return repo.getSupplierPaymentHistory(supplierUserId);
}
