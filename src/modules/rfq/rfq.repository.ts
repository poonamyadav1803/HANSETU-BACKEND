import { db } from "../../db";
import {
  rfqRequests, rfqAssignments, purchaseOrders, salesInvoices, shipments,
  users, type RfqRequest, type RfqAssignment, type PurchaseOrder,
  type SalesInvoice, type Shipment,
} from "../../db/schema";
import { eq, and, desc, sql, or, ne, inArray } from "drizzle-orm";

const DOCUMENT_NUMBER_START = 110001;

// ─── RFQ Requests ────────────────────────────────────────────────────────────

export async function createRfqRequest(data: {
  rfqNumber: string;
  buyerId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  requiredBy?: string;
  specs?: string;
  orderType: string;
  requestType: string;
  attachments: string[];
}): Promise<RfqRequest> {
  const [row] = await db.insert(rfqRequests).values({
    rfqNumber: data.rfqNumber,
    buyerId: data.buyerId,
    productName: data.productName,
    category: data.category,
    quantity: String(data.quantity),
    unit: data.unit,
    deliveryLocation: data.deliveryLocation,
    requiredBy: data.requiredBy,
    specs: data.specs,
    orderType: data.orderType,
    requestType: data.requestType,
    attachments: data.attachments,
    status: "SUBMITTED",
  }).returning();
  return row;
}

// Buyer-safe assignment projection — strips supplier price and margin from buyer view
const buyerSafeAssignment = {
  id: rfqAssignments.id,
  assignmentMode: rfqAssignments.assignmentMode,
  negotiationStatus: rfqAssignments.negotiationStatus,
  transportCompany: rfqAssignments.transportCompany,
  approvedAt: rfqAssignments.approvedAt,
  // finalAgreedPrice, negotiatedPrice, adminMarginPct, internalNotes intentionally omitted
};

// Buyer-safe invoice projection — strips marginAmount from buyer view
const buyerSafeInvoice = {
  id: salesInvoices.id,
  invoiceNumber: salesInvoices.invoiceNumber,
  productName: salesInvoices.productName,
  quantity: salesInvoices.quantity,
  unit: salesInvoices.unit,
  baseAmount: salesInvoices.baseAmount,
  gstRate: salesInvoices.gstRate,
  gstAmount: salesInvoices.gstAmount,
  totalAmount: salesInvoices.totalAmount,
  hsnCode: salesInvoices.hsnCode,
  deliveryLocation: salesInvoices.deliveryLocation,
  status: salesInvoices.status,
  razorpayOrderId: salesInvoices.razorpayOrderId,
  razorpayPaymentId: salesInvoices.razorpayPaymentId,
  paidAt: salesInvoices.paidAt,
  // marginAmount intentionally omitted
};

// Buyer never sees competing quotes — only the winning (APPROVED) assignment, if any.
const approvedAssignmentJoin = and(
  eq(rfqAssignments.rfqId, rfqRequests.id),
  eq(rfqAssignments.negotiationStatus, "APPROVED"),
);

export async function getRfqsByBuyer(buyerId: string) {
  return db
    .select({
      rfq: rfqRequests,
      assignment: buyerSafeAssignment,
      po: purchaseOrders,
      invoice: buyerSafeInvoice,
      shipment: shipments,
    })
    .from(rfqRequests)
    .leftJoin(rfqAssignments, approvedAssignmentJoin)
    .leftJoin(purchaseOrders, eq(purchaseOrders.rfqId, rfqRequests.id))
    .leftJoin(salesInvoices, eq(salesInvoices.rfqId, rfqRequests.id))
    .leftJoin(shipments, eq(shipments.rfqId, rfqRequests.id))
    .where(eq(rfqRequests.buyerId, buyerId))
    .orderBy(desc(rfqRequests.createdAt));
}

export async function getRfqById(id: string) {
  const [row] = await db
    .select({
      rfq: rfqRequests,
      assignment: buyerSafeAssignment,
      po: purchaseOrders,
      invoice: buyerSafeInvoice,
    })
    .from(rfqRequests)
    .leftJoin(rfqAssignments, approvedAssignmentJoin)
    .leftJoin(purchaseOrders, eq(purchaseOrders.rfqId, rfqRequests.id))
    .leftJoin(salesInvoices, eq(salesInvoices.rfqId, rfqRequests.id))
    .where(eq(rfqRequests.id, id));
  return row ?? null;
}

export async function updateRfqStatus(id: string, status: string) {
  await db.update(rfqRequests).set({ status, updatedAt: new Date() }).where(eq(rfqRequests.id, id));
}

export async function generateRfqNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rfqRequests);
  return `RFQ/${year}/${String(count + DOCUMENT_NUMBER_START).padStart(6, "0")}`;
}

// ─── Admin: all RFQs ─────────────────────────────────────────────────────────

// `assignments` is fetched separately (see getAssignmentsByRfq / getAssignmentsByRfqIds)
// and merged in the service layer — an RFQ can now have multiple candidate assignments,
// so joining rfq_assignments directly here would fan out one RFQ into multiple rows.
export async function adminGetAllRfqs(status?: string) {
  const baseQuery = db
    .select({
      rfq: rfqRequests,
      buyer: {
        id: users.id,
        username: users.username,
        email: users.email,
        businessType: users.businessType,
      },
      po: purchaseOrders,
      invoice: salesInvoices,
    })
    .from(rfqRequests)
    .leftJoin(users, eq(users.id, rfqRequests.buyerId))
    .leftJoin(purchaseOrders, eq(purchaseOrders.rfqId, rfqRequests.id))
    .leftJoin(salesInvoices, eq(salesInvoices.rfqId, rfqRequests.id))
    .orderBy(desc(rfqRequests.createdAt));

  if (status) {
    return baseQuery.where(eq(rfqRequests.status, status));
  }
  return baseQuery;
}

export async function adminGetRfqById(id: string) {
  const [row] = await db
    .select({
      rfq: rfqRequests,
      buyer: {
        id: users.id,
        username: users.username,
        email: users.email,
        businessType: users.businessType,
      },
      po: purchaseOrders,
      invoice: salesInvoices,
    })
    .from(rfqRequests)
    .leftJoin(users, eq(users.id, rfqRequests.buyerId))
    .leftJoin(purchaseOrders, eq(purchaseOrders.rfqId, rfqRequests.id))
    .leftJoin(salesInvoices, eq(salesInvoices.rfqId, rfqRequests.id))
    .where(eq(rfqRequests.id, id));
  return row ?? null;
}

// ─── Assignments ─────────────────────────────────────────────────────────────

// One row per (rfqId, supplierUserId) pair — re-inviting the same candidate updates
// their existing row in place; inviting a new candidate adds another row, so an RFQ
// can carry multiple parallel candidate assignments while admin compares quotes.
export async function createOrUpdateAssignment(data: {
  rfqId: string;
  assigneeUserId: string;
  assignedBy: string;
  assignmentMode: "REQUEST_QUOTE" | "DIRECT_PRICE";
  negotiatedPrice?: number;
  adminMarginPct: number;
  transportCompany?: string;
  transporterEmail?: string;
  transporterPhone?: string;
  deliveryCharge?: number;
  internalNotes?: string;
}): Promise<RfqAssignment> {
  const pairCondition = and(
    eq(rfqAssignments.rfqId, data.rfqId),
    eq(rfqAssignments.supplierUserId, data.assigneeUserId),
  );

  const existing = await db
    .select()
    .from(rfqAssignments)
    .where(pairCondition)
    .limit(1);

  if (existing.length > 0) {
    const [row] = await db
      .update(rfqAssignments)
      .set({
        assignedBy: data.assignedBy,
        assignmentMode: data.assignmentMode,
        negotiatedPrice: data.negotiatedPrice != null ? String(data.negotiatedPrice) : null,
        adminMarginPct: String(data.adminMarginPct),
        transportCompany: data.transportCompany ?? null,
        transporterEmail: data.transporterEmail ?? null,
        transporterPhone: data.transporterPhone ?? null,
        deliveryCharge: data.deliveryCharge != null ? String(data.deliveryCharge) : null,
        internalNotes: data.internalNotes,
        negotiationStatus: "PENDING",
      })
      .where(pairCondition)
      .returning();
    return row;
  }

  const [row] = await db.insert(rfqAssignments).values({
    rfqId: data.rfqId,
    supplierUserId: data.assigneeUserId,
    assignedBy: data.assignedBy,
    assignmentMode: data.assignmentMode,
    negotiatedPrice: data.negotiatedPrice != null ? String(data.negotiatedPrice) : null,
    adminMarginPct: String(data.adminMarginPct),
    transportCompany: data.transportCompany ?? null,
    transporterEmail: data.transporterEmail ?? null,
    transporterPhone: data.transporterPhone ?? null,
    deliveryCharge: data.deliveryCharge != null ? String(data.deliveryCharge) : null,
    internalNotes: data.internalNotes,
    negotiationStatus: "PENDING",
  }).returning();
  return row;
}

// Includes basic supplier identity so the admin comparison view can show "who" —
// admin-only data, never exposed to buyer- or supplier-facing endpoints.
const assignmentWithSupplier = {
  id: rfqAssignments.id,
  rfqId: rfqAssignments.rfqId,
  supplierUserId: rfqAssignments.supplierUserId,
  supplierUsername: users.username,
  supplierEmail: users.email,
  supplierProfile: users.profile,
  assignmentMode: rfqAssignments.assignmentMode,
  adminMarginPct: rfqAssignments.adminMarginPct,
  negotiatedPrice: rfqAssignments.negotiatedPrice,
  finalAgreedPrice: rfqAssignments.finalAgreedPrice,
  negotiationStatus: rfqAssignments.negotiationStatus,
  internalNotes: rfqAssignments.internalNotes,
  transportCompany: rfqAssignments.transportCompany,
  transporterEmail: rfqAssignments.transporterEmail,
  transporterPhone: rfqAssignments.transporterPhone,
  deliveryCharge: rfqAssignments.deliveryCharge,
  approvedAt: rfqAssignments.approvedAt,
  supplierQuotedPrice: rfqAssignments.supplierQuotedPrice,
  supplierLeadTimeDays: rfqAssignments.supplierLeadTimeDays,
  supplierMoq: rfqAssignments.supplierMoq,
  quoteValidityDate: rfqAssignments.quoteValidityDate,
  supplierNotes: rfqAssignments.supplierNotes,
  quoteSubmittedAt: rfqAssignments.quoteSubmittedAt,
  createdAt: rfqAssignments.createdAt,
};

export async function getAssignmentsByRfq(rfqId: string) {
  return db
    .select(assignmentWithSupplier)
    .from(rfqAssignments)
    .leftJoin(users, eq(users.id, rfqAssignments.supplierUserId))
    .where(eq(rfqAssignments.rfqId, rfqId));
}

// Batch version for the admin list page — one query for every RFQ on the page,
// grouped in JS, instead of an N+1 or a fan-out join.
export async function getAssignmentsByRfqIds(rfqIds: string[]) {
  if (rfqIds.length === 0) return {};
  const rows = await db
    .select(assignmentWithSupplier)
    .from(rfqAssignments)
    .leftJoin(users, eq(users.id, rfqAssignments.supplierUserId))
    .where(inArray(rfqAssignments.rfqId, rfqIds));
  const grouped: Record<string, typeof rows> = {};
  for (const row of rows) {
    (grouped[row.rfqId] ??= []).push(row);
  }
  return grouped;
}

export async function getAssignmentById(assignmentId: string): Promise<RfqAssignment | null> {
  const [row] = await db.select().from(rfqAssignments).where(eq(rfqAssignments.id, assignmentId));
  return row ?? null;
}

export async function getAssignmentByRfqAndSupplier(rfqId: string, supplierUserId: string): Promise<RfqAssignment | null> {
  const [row] = await db
    .select()
    .from(rfqAssignments)
    .where(and(eq(rfqAssignments.rfqId, rfqId), eq(rfqAssignments.supplierUserId, supplierUserId)));
  return row ?? null;
}

export async function approveAssignment(assignmentId: string, data: {
  finalAgreedPrice: number;
  adminMarginPct: number;
  deliveryCharge: number;
  transportCompany?: string;
  transporterEmail?: string;
  transporterPhone?: string;
}) {
  await db
    .update(rfqAssignments)
    .set({
      negotiationStatus: "APPROVED",
      finalAgreedPrice: String(data.finalAgreedPrice),
      adminMarginPct: String(data.adminMarginPct),
      deliveryCharge: String(data.deliveryCharge),
      transportCompany: data.transportCompany ?? null,
      transporterEmail: data.transporterEmail ?? null,
      transporterPhone: data.transporterPhone ?? null,
      approvedAt: new Date(),
    })
    .where(eq(rfqAssignments.id, assignmentId));
}

// Closes out every other candidate once one assignment is approved, so they stop
// showing as "pending" / "quoted" on their own dashboards.
export async function rejectOtherAssignments(rfqId: string, exceptAssignmentId: string) {
  await db
    .update(rfqAssignments)
    .set({ negotiationStatus: "REJECTED" })
    .where(and(
      eq(rfqAssignments.rfqId, rfqId),
      ne(rfqAssignments.id, exceptAssignmentId),
      inArray(rfqAssignments.negotiationStatus, ["PENDING", "SUPPLIER_QUOTED"]),
    ));
}

// ─── Assignees list ───────────────────────────────────────────────────────────

export async function getAssignedRfqsBySupplier(supplierUserId: string) {
  return db
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
        requestType: rfqRequests.requestType,
        status: rfqRequests.status,
        createdAt: rfqRequests.createdAt,
        // buyerId intentionally excluded
      },
      assignment: {
        id: rfqAssignments.id,
        assignmentMode: rfqAssignments.assignmentMode,
        negotiatedPrice: rfqAssignments.negotiatedPrice,
        // adminMarginPct intentionally excluded — supplier must not see Hansetu's margin
        negotiationStatus: rfqAssignments.negotiationStatus,
        // internalNotes intentionally excluded — admin-only
        transportCompany: rfqAssignments.transportCompany,
        // deliveryCharge intentionally excluded — added to buyer invoice only, not supplier's concern
        approvedAt: rfqAssignments.approvedAt,
        supplierQuotedPrice: rfqAssignments.supplierQuotedPrice,
        supplierLeadTimeDays: rfqAssignments.supplierLeadTimeDays,
        supplierMoq: rfqAssignments.supplierMoq,
        quoteValidityDate: rfqAssignments.quoteValidityDate,
        supplierNotes: rfqAssignments.supplierNotes,
        quoteSubmittedAt: rfqAssignments.quoteSubmittedAt,
      },
    })
    .from(rfqAssignments)
    .innerJoin(rfqRequests, eq(rfqRequests.id, rfqAssignments.rfqId))
    .where(eq(rfqAssignments.supplierUserId, supplierUserId))
    .orderBy(desc(rfqAssignments.createdAt));
}

export async function submitSupplierQuote(assignmentId: string, data: {
  supplierQuotedPrice: number;
  supplierLeadTimeDays?: number;
  supplierMoq?: number;
  quoteValidityDate?: string;
  supplierNotes?: string;
}) {
  await db.update(rfqAssignments).set({
    supplierQuotedPrice: String(data.supplierQuotedPrice),
    supplierLeadTimeDays: data.supplierLeadTimeDays ?? null,
    supplierMoq: data.supplierMoq ? String(data.supplierMoq) : null,
    quoteValidityDate: data.quoteValidityDate ?? null,
    supplierNotes: data.supplierNotes ?? null,
    quoteSubmittedAt: new Date(),
    negotiationStatus: "SUPPLIER_QUOTED",
  }).where(eq(rfqAssignments.id, assignmentId));
}

export async function getAssigneesByType(
  type: "supplier" | "manufacturer",
  filters?: { state?: string; category?: string; subcategory?: string; verified?: boolean; excludeUserId?: string },
) {
  const businessTypes =
    type === "supplier"
      ? ["raw_material_supplier", "both"]
      : ["manufacturer", "both"];

  const conditions: ReturnType<typeof eq>[] = [
    eq(users.isActive, true),
    or(...businessTypes.map((bt) => eq(users.businessType, bt))) as ReturnType<typeof eq>,
  ];

  if (filters?.verified) {
    conditions.push(eq(users.registrationComplete, true));
  }

  if (filters?.excludeUserId) {
    conditions.push(ne(users.id, filters.excludeUserId));
  }

  let rows = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      mobile: users.mobile,
      gstNumber: users.gstNumber,
      businessType: users.businessType,
      registrationComplete: users.registrationComplete,
      profile: users.profile,
    })
    .from(users)
    .where(and(...conditions))
    .orderBy(users.username);

  if (filters?.state) {
    const s = filters.state.toLowerCase();
    rows = rows.filter((r) => {
      const p = r.profile as { addresses?: Array<{ state?: string }> } | null;
      return p?.addresses?.some((a) => a.state?.toLowerCase().includes(s));
    });
  }

  if (filters?.category) {
    const c = filters.category.toLowerCase();
    rows = rows.filter((r) => {
      const p = r.profile as { rawMaterialProducts?: string[]; manufacturingProductsFlat?: string[] } | null;
      const products = [...(p?.rawMaterialProducts ?? []), ...(p?.manufacturingProductsFlat ?? [])];
      return products.some((prod) => prod.toLowerCase().includes(c));
    });
  }

  if (filters?.subcategory) {
    const sc = filters.subcategory.toLowerCase();
    rows = rows.filter((r) => {
      const p = r.profile as { rawMaterialProducts?: string[]; manufacturingProductsFlat?: string[] } | null;
      const products = [...(p?.rawMaterialProducts ?? []), ...(p?.manufacturingProductsFlat ?? [])];
      return products.some((prod) => prod.toLowerCase().includes(sc));
    });
  }

  return rows;
}

export async function getAssigneeById(id: string) {
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      mobile: users.mobile,
      gstNumber: users.gstNumber,
      businessType: users.businessType,
      registrationComplete: users.registrationComplete,
      profile: users.profile,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id));
  return row ?? null;
}

// ─── Invoice lookups (payment) ────────────────────────────────────────────────

export async function getInvoiceById(id: string): Promise<SalesInvoice | null> {
  const [row] = await db.select().from(salesInvoices).where(eq(salesInvoices.id, id));
  return row ?? null;
}

export async function getInvoiceByRazorpayOrder(razorpayOrderId: string): Promise<SalesInvoice | null> {
  const [row] = await db.select().from(salesInvoices).where(eq(salesInvoices.razorpayOrderId, razorpayOrderId));
  return row ?? null;
}

export async function markInvoicePaid(id: string, razorpayPaymentId: string, razorpayOrderId: string) {
  await db.update(salesInvoices).set({
    status: "PAID",
    razorpayPaymentId,
    razorpayOrderId,
    paidAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(salesInvoices.id, id));
}

export async function setInvoiceAwaitingPayment(id: string, razorpayOrderId: string) {
  await db.update(salesInvoices).set({
    status: "AWAITING_PAYMENT",
    razorpayOrderId,
    updatedAt: new Date(),
  }).where(eq(salesInvoices.id, id));
}

export async function adminMarkInvoicePaidManually(id: string) {
  await db.update(salesInvoices).set({
    status: "PAID",
    paidAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(salesInvoices.id, id));
}

export async function markPoPaymentReleased(poId: string) {
  await db.update(purchaseOrders).set({
    paymentReleased: true,
    paymentReleasedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(purchaseOrders.id, poId));
}

// ─── PO / Invoice number generators ──────────────────────────────────────────

export async function generatePoNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(purchaseOrders);
  return `PO/${year}/${String(count + DOCUMENT_NUMBER_START).padStart(6, "0")}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(salesInvoices);
  return `INV/${year}/${String(count + DOCUMENT_NUMBER_START).padStart(6, "0")}`;
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export async function createPurchaseOrder(data: {
  poNumber: string;
  rfqId: string;
  supplierUserId: string;
  buyerUserId: string;
  productName: string;
  quantity: number;
  unit: string;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  hsnCode?: string;
  deliveryLocation?: string;
  transportCompany?: string;
  transporterEmail?: string;
  transporterPhone?: string;
}): Promise<PurchaseOrder> {
  const [row] = await db.insert(purchaseOrders).values({
    poNumber: data.poNumber,
    rfqId: data.rfqId,
    supplierUserId: data.supplierUserId,
    buyerUserId: data.buyerUserId,
    productName: data.productName,
    quantity: String(data.quantity),
    unit: data.unit,
    baseAmount: String(data.baseAmount),
    gstAmount: String(data.gstAmount),
    totalAmount: String(data.totalAmount),
    hsnCode: data.hsnCode,
    deliveryLocation: data.deliveryLocation,
    transportCompany: data.transportCompany,
    transporterEmail: data.transporterEmail,
    transporterPhone: data.transporterPhone,
    status: "ISSUED",
  }).returning();
  return row;
}

export async function getPosBySupplier(supplierUserId: string) {
  return db
    .select({ po: purchaseOrders, rfq: rfqRequests, shipment: shipments })
    .from(purchaseOrders)
    .innerJoin(rfqRequests, eq(rfqRequests.id, purchaseOrders.rfqId))
    .leftJoin(shipments, eq(shipments.poId, purchaseOrders.id))
    .where(eq(purchaseOrders.supplierUserId, supplierUserId))
    .orderBy(desc(purchaseOrders.createdAt));
}

export async function getPoById(id: string): Promise<PurchaseOrder | null> {
  const [row] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
  return row ?? null;
}

// Step 4: supplier confirms PO
export async function confirmPo(id: string, expectedDispatchDate: string) {
  await db.update(purchaseOrders).set({
    status: "CONFIRMED",
    acknowledgedAt: new Date(),
    expectedDispatchDate,
    updatedAt: new Date(),
  }).where(eq(purchaseOrders.id, id));
}

// Step 5: supplier uploads their invoice + e-way bill
export async function uploadSupplierInvoice(id: string, data: {
  supplierInvoiceNo: string;
  supplierInvoiceAmount: number;
  ewayBillNo?: string;
}) {
  await db.update(purchaseOrders).set({
    supplierInvoiceNo: data.supplierInvoiceNo,
    supplierInvoiceAmount: String(data.supplierInvoiceAmount),
    ewayBillNo: data.ewayBillNo,
    status: "INVOICE_UPLOADED",
    updatedAt: new Date(),
  }).where(eq(purchaseOrders.id, id));
}

// ─── Sales Invoices ───────────────────────────────────────────────────────────

export async function createSalesInvoice(data: {
  invoiceNumber: string;
  rfqId: string;
  poId: string;
  buyerUserId: string;
  productName: string;
  quantity: number;
  unit: string;
  baseAmount: number;
  marginAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  hsnCode?: string;
  deliveryLocation?: string;
}): Promise<SalesInvoice> {
  const [row] = await db.insert(salesInvoices).values({
    invoiceNumber: data.invoiceNumber,
    rfqId: data.rfqId,
    poId: data.poId,
    buyerUserId: data.buyerUserId,
    productName: data.productName,
    quantity: String(data.quantity),
    unit: data.unit,
    baseAmount: String(data.baseAmount),
    marginAmount: String(data.marginAmount),
    gstRate: String(data.gstRate),
    gstAmount: String(data.gstAmount),
    totalAmount: String(data.totalAmount),
    hsnCode: data.hsnCode,
    deliveryLocation: data.deliveryLocation,
    status: "ISSUED",
  }).returning();
  return row;
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export async function generateShipmentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(shipments);
  return `SHP/${year}/${String(count + DOCUMENT_NUMBER_START).padStart(6, "0")}`;
}

// Step 6: supplier creates shipment
export async function createShipment(data: {
  shipmentNumber: string;
  poId: string;
  rfqId: string;
  buyerId: string;
  supplierId: string;
  transporterName: string;
  docketNumber: string;
  dispatchDate: string;
  ewayBillNo?: string;
}): Promise<Shipment> {
  const firstCheckpoint = [{
    label: "Dispatched",
    location: "Supplier Warehouse",
    note: `Docket: ${data.docketNumber}`,
    ts: new Date().toISOString(),
  }];

  const [row] = await db.insert(shipments).values({
    shipmentNumber: data.shipmentNumber,
    poId: data.poId,
    rfqId: data.rfqId,
    buyerId: data.buyerId,
    supplierId: data.supplierId,
    transporterName: data.transporterName,
    docketNumber: data.docketNumber,
    dispatchDate: data.dispatchDate,
    ewayBillNo: data.ewayBillNo,
    status: "DISPATCHED",
    checkpoints: firstCheckpoint,
  }).returning();
  return row;
}

export async function getShipmentByRfqId(rfqId: string): Promise<Shipment | null> {
  const [row] = await db.select().from(shipments).where(eq(shipments.rfqId, rfqId));
  return row ?? null;
}

export async function getShipmentsByBuyer(buyerId: string) {
  return db
    .select({ shipment: shipments, rfq: rfqRequests })
    .from(shipments)
    .innerJoin(rfqRequests, eq(rfqRequests.id, shipments.rfqId))
    .where(eq(shipments.buyerId, buyerId))
    .orderBy(desc(shipments.createdAt));
}

export async function adminGetAllShipments() {
  return db
    .select({
      shipment: shipments,
      rfq: rfqRequests,
      buyer: { id: users.id, username: users.username, email: users.email },
    })
    .from(shipments)
    .innerJoin(rfqRequests, eq(rfqRequests.id, shipments.rfqId))
    .innerJoin(users, eq(users.id, shipments.buyerId))
    .orderBy(desc(shipments.createdAt));
}

// Step 7: admin adds a transit checkpoint
export async function addCheckpoint(id: string, checkpoint: { label: string; location: string; note?: string }) {
  const [current] = await db.select().from(shipments).where(eq(shipments.id, id));
  if (!current) return;
  const existing = (current.checkpoints as unknown[]) ?? [];
  const updated = [...existing, { ...checkpoint, ts: new Date().toISOString() }];
  await db.update(shipments).set({
    checkpoints: updated,
    status: "IN_TRANSIT",
    updatedAt: new Date(),
  }).where(eq(shipments.id, id));
}

// Step 8: admin marks delivered
export async function markShipmentDelivered(id: string) {
  await db.update(shipments).set({
    status: "DELIVERED",
    deliveredAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(shipments.id, id));
}

// Step 9: buyer marks received → closes order
export async function markShipmentReceived(id: string) {
  await db.update(shipments).set({
    status: "RECEIVED",
    receivedByBuyerAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(shipments.id, id));
}

// ─── Payment Audit ────────────────────────────────────────────────────────────

export async function getBuyerPaymentHistory(buyerUserId: string) {
  return db
    .select({
      invoice: salesInvoices,
      rfq: {
        rfqNumber: rfqRequests.rfqNumber,
        productName: rfqRequests.productName,
        category: rfqRequests.category,
      },
    })
    .from(salesInvoices)
    .innerJoin(rfqRequests, eq(rfqRequests.id, salesInvoices.rfqId))
    .where(eq(salesInvoices.buyerUserId, buyerUserId))
    .orderBy(desc(salesInvoices.createdAt));
}

export async function getSupplierPaymentHistory(supplierUserId: string) {
  return db
    .select({
      po: purchaseOrders,
      rfq: {
        rfqNumber: rfqRequests.rfqNumber,
        productName: rfqRequests.productName,
        category: rfqRequests.category,
      },
    })
    .from(purchaseOrders)
    .innerJoin(rfqRequests, eq(rfqRequests.id, purchaseOrders.rfqId))
    .where(eq(purchaseOrders.supplierUserId, supplierUserId))
    .orderBy(desc(purchaseOrders.createdAt));
}

export async function getAdminPaymentAudit() {
  const buyerPayments = await db
    .select({
      invoice: salesInvoices,
      buyer: {
        id: users.id,
        username: users.username,
        email: users.email,
        gstNumber: users.gstNumber,
      },
      rfq: {
        rfqNumber: rfqRequests.rfqNumber,
        productName: rfqRequests.productName,
        category: rfqRequests.category,
      },
    })
    .from(salesInvoices)
    .innerJoin(rfqRequests, eq(rfqRequests.id, salesInvoices.rfqId))
    .innerJoin(users, eq(users.id, salesInvoices.buyerUserId))
    .orderBy(desc(salesInvoices.createdAt));

  const supplierPayments = await db
    .select({
      po: purchaseOrders,
      supplier: {
        id: users.id,
        username: users.username,
        email: users.email,
        gstNumber: users.gstNumber,
      },
      rfq: {
        rfqNumber: rfqRequests.rfqNumber,
        productName: rfqRequests.productName,
        category: rfqRequests.category,
      },
      invoiceTotalAmount: salesInvoices.totalAmount,
    })
    .from(purchaseOrders)
    .innerJoin(rfqRequests, eq(rfqRequests.id, purchaseOrders.rfqId))
    .innerJoin(users, eq(users.id, purchaseOrders.supplierUserId))
    .leftJoin(salesInvoices, eq(salesInvoices.rfqId, purchaseOrders.rfqId))
    .orderBy(desc(purchaseOrders.createdAt));

  return { buyerPayments, supplierPayments };
}
