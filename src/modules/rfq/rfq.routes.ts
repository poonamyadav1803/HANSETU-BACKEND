import { Router } from "express";
import multer from "multer";
import * as ctrl from "./rfq.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: 10 * 1024 * 1024 },
});

// ─── Buyer / Supplier routes  (prefix: /api/rfq) ─────────────────────────────
export class RfqRoutes {
  public router = Router();

  constructor() {
    // Buyer: submit RFQ
    this.router.post("/", authMiddleware, upload.array("attachments", 5), ctrl.submit);

    // Buyer: own RFQs
    this.router.get("/my", authMiddleware, ctrl.getMy);

    // Supplier/Assignee: assigned RFQs (visible before PO is created) — static paths BEFORE /:id
    this.router.get("/my-assigned", authMiddleware, ctrl.getMyAssigned);

    // Supplier: submit quote on an assigned RFQ — static path BEFORE /:id
    this.router.post("/:id/submit-quote", authMiddleware, ctrl.submitQuote);

    // Supplier/Assignee: own POs — static paths BEFORE /:id
    this.router.get("/my-pos", authMiddleware, ctrl.getMyPos);

    // PO actions (supplier)
    this.router.patch("/pos/:id/confirm", authMiddleware, ctrl.confirmPo);
    this.router.patch("/pos/:id/upload-invoice", authMiddleware, ctrl.uploadInvoice);
    this.router.post("/pos/:id/shipment", authMiddleware, ctrl.createShipment);
    this.router.patch("/pos/:id/ack-payment", authMiddleware, upload.single("receipt"), ctrl.supplierAckPayment);

    // Razorpay payment: create order then verify after payment
    this.router.post("/invoices/:id/create-order", authMiddleware, ctrl.createRazorpayOrder);
    this.router.post("/invoices/:id/verify-payment", authMiddleware, ctrl.verifyRazorpayPayment);

    // Buyer marks received (closes order)
    this.router.patch("/shipments/:id/received", authMiddleware, ctrl.markReceived);

    // Payment audit history (static paths before /:id)
    this.router.get("/payment-history", authMiddleware, ctrl.buyerGetPaymentHistory);
    this.router.get("/supplier-payment-history", authMiddleware, ctrl.supplierGetPaymentHistory);

    // Buyer: single RFQ detail
    this.router.get("/:id", authMiddleware, ctrl.getOne);
  }
}

// ─── Admin routes  (prefix: /api/admin) ──────────────────────────────────────
export class AdminRfqRoutes {
  public router = Router();

  constructor() {
    // Assignees list filtered by type (?type=supplier|manufacturer&state=...&category=...&verified=true)
    this.router.get("/assignees-list", adminMiddleware, ctrl.adminGetAssigneesList);

    // Single assignee profile
    this.router.get("/assignees/:id/profile", adminMiddleware, ctrl.adminGetAssigneeProfile);

    // RFQ list + detail
    this.router.get("/rfqs", adminMiddleware, ctrl.adminGetAll);
    this.router.get("/rfqs/:id", adminMiddleware, ctrl.adminGetOne);

    // Step A: assign supplier/manufacturer
    this.router.patch("/rfqs/:id/assign", adminMiddleware, ctrl.adminAssign);

    // Step B: approve → auto-create PO + Invoice
    this.router.patch("/rfqs/:id/approve", adminMiddleware, ctrl.adminApprove);

    // Shipment management
    this.router.get("/shipments", adminMiddleware, ctrl.adminListShipments);
    this.router.patch("/shipments/:id/checkpoint", adminMiddleware, ctrl.adminAddCheckpoint);
    this.router.patch("/shipments/:id/deliver", adminMiddleware, ctrl.adminMarkDelivered);

    // Payment management
    this.router.patch("/invoices/:id/mark-paid", adminMiddleware, ctrl.adminMarkInvoicePaid);
    this.router.patch("/pos/:id/release-payment", adminMiddleware, ctrl.adminReleasePayment);
    this.router.patch("/pos/:id/record-supplier-payment", adminMiddleware, upload.single("receipt"), ctrl.adminRecordSupplierPayment);
    this.router.patch("/pos/:id/record-transporter-payment", adminMiddleware, upload.single("receipt"), ctrl.adminRecordTransporterPayment);

    // Manual status overrides
    this.router.patch("/rfqs/:id/status", adminMiddleware, ctrl.adminSetRfqStatus);
    this.router.patch("/pos/:id/status", adminMiddleware, ctrl.adminSetPoStatus);

    // Payment audit
    this.router.get("/payment-audit", adminMiddleware, ctrl.adminGetPaymentAudit);
  }
}
