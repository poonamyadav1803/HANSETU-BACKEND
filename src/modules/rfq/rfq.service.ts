import { HttpException } from "../../core/HttpException";
import { FileUploadService } from "../../services/file-upload.service";
import { db } from "../../db";
import { shipments, purchaseOrders } from "../../db/schema";
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
  const rfqNumber = await repo.generateRfqNumber();

  let attachmentUrls: string[] = [];
  if (files.length > 0) {
    const uploaded = await fileUpload.uploadMany(files, { folder: `rfq/${rfqNumber}` });
    attachmentUrls = uploaded.map((u) => u.url);
  }

  return repo.createRfqRequest({
    rfqNumber,
    buyerId,
    productName: dto.productName,
    category: dto.category,
    quantity: dto.quantity,
    unit: dto.unit,
    deliveryLocation: dto.deliveryLocation,
    requiredBy: dto.requiredBy,
    specs: dto.specs,
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

export async function getAssigneesList(type: "supplier" | "manufacturer") {
  return repo.getAssigneesByType(type);
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
    negotiatedPrice: dto.negotiatedPrice,
    adminMarginPct: dto.adminMarginPct,
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

  if (negotiatedPrice <= 0) {
    throw new HttpException(400, "Negotiated price must be set before approving");
  }

  // PO: platform → supplier (no margin shown)
  const poBase = negotiatedPrice;
  const poGst = parseFloat((poBase * 0.18).toFixed(2));
  const poTotal = parseFloat((poBase + poGst).toFixed(2));

  // Sales Invoice: platform → buyer (includes margin)
  const marginAmt = parseFloat((negotiatedPrice * (marginPct / 100)).toFixed(2));
  const invBase = parseFloat((negotiatedPrice + marginAmt).toFixed(2));
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
  if (!["PENDING", "SUPPLIER_QUOTED"].includes(assignment.negotiationStatus)) {
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
}

// ─── Admin: all shipments ─────────────────────────────────────────────────────

export async function adminListShipments() {
  return repo.adminGetAllShipments();
}
