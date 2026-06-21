import { z } from "zod";

export const submitRfqSchema = z.object({
  productName: z.string().min(2, "Product name is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
  mfrProductId: z.string().optional(),
  notes: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().default("units"),
  deliveryLocation: z.string().min(3, "Delivery location is required"),
  requiredBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format").optional(),
  specs: z.string().optional(),
  orderType: z.enum(["SAMPLE", "BULK"]).default("BULK"),
  requestType: z.enum(["PRODUCT_CATALOGUE", "COMPONENT_MANUFACTURER"]).default("PRODUCT_CATALOGUE"),
}).superRefine((val, ctx) => {
  if (val.requestType === "PRODUCT_CATALOGUE") {
    if (!val.mfrProductId && (!val.productName || val.productName.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productName"],
        message: "Product name is required when not selecting from catalogue",
      });
    }
  }
  if (val.requestType === "COMPONENT_MANUFACTURER") {
    if (!val.productName || val.productName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["productName"], message: "Component name is required" });
    }
    if (!val.category || val.category.length < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["category"], message: "Category is required" });
    }
    if (!val.specs || val.specs.trim().length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["specs"], message: "Technical specifications are required (minimum 10 characters)" });
    }
  }
});

// Admin assigns a supplier/manufacturer and can either set a direct price
// or ask the assignee to submit a quote.
export const assignSchema = z.object({
  assigneeUserId: z.string().uuid("A valid user ID is required"),
  assignmentMode: z.enum(["REQUEST_QUOTE", "DIRECT_PRICE"]).default("REQUEST_QUOTE"),
  negotiatedPrice: z.coerce.number().positive("Negotiated price must be positive").optional(),
  adminMarginPct: z.coerce.number().min(0).max(100).default(10),
  transportCompany: z.string().max(255).optional(),
  deliveryCharge: z.coerce.number().min(0, "Delivery charge cannot be negative").optional(),
  internalNotes: z.string().max(5000).optional(),
}).superRefine((value, ctx) => {
  if (value.assignmentMode === "DIRECT_PRICE" && value.negotiatedPrice == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["negotiatedPrice"],
      message: "Negotiated price is required when admin adds a direct price",
    });
  }
});

// Admin approves a specific candidate's assignment → creates PO + Invoice.
// assignmentId is required once more than one candidate has been invited;
// the price/margin/transport fields let admin set or override these based on
// the actual quote received, instead of only what was guessed at assign time.
export const approveRfqSchema = z.object({
  assignmentId: z.string().uuid().optional(),
  hsnCode: z.string().max(20).optional(),
  negotiatedPrice: z.coerce.number().positive("Negotiated price must be positive").optional(),
  adminMarginPct: z.coerce.number().min(0).max(100).optional(),
  transportCompany: z.string().max(255).optional(),
  deliveryCharge: z.coerce.number().min(0, "Delivery charge cannot be negative").optional(),
});

// Supplier confirms PO
export const confirmPoSchema = z.object({
  expectedDispatchDate: z.string().min(1, "Expected dispatch date is required"),
});

// Supplier uploads their own invoice + e-way bill
export const uploadInvoiceSchema = z.object({
  supplierInvoiceNo: z.string().min(1, "Invoice number is required"),
  supplierInvoiceAmount: z.coerce.number().positive("Invoice amount is required"),
  ewayBillNo: z.string().optional(),
});

// Supplier creates shipment
export const createShipmentSchema = z.object({
  transporterName: z.string().min(1, "Transporter name is required"),
  docketNumber: z.string().min(1, "Docket / LR number is required"),
  dispatchDate: z.string().min(1, "Dispatch date is required"),
  ewayBillNo: z.string().optional(),
});

// Supplier submits quote (Story 3.2–3.3)
export const submitQuoteSchema = z.object({
  unitPrice: z.coerce.number().positive("Unit price is required"),
  leadTimeDays: z.coerce.number().int().positive().optional(),
  moqQuantity: z.coerce.number().positive().optional(),
  quoteValidityDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

// Admin adds a transit checkpoint
export const addCheckpointSchema = z.object({
  label: z.string().min(1, "Label is required"),
  location: z.string().min(1, "Location is required"),
  note: z.string().optional(),
});

export type SubmitRfqDto = z.infer<typeof submitRfqSchema>;
export type AssignDto = z.infer<typeof assignSchema>;
export type ApproveRfqDto = z.infer<typeof approveRfqSchema>;
export type SubmitQuoteDto = z.infer<typeof submitQuoteSchema>;
export type ConfirmPoDto = z.infer<typeof confirmPoSchema>;
export type UploadInvoiceDto = z.infer<typeof uploadInvoiceSchema>;
export type CreateShipmentDto = z.infer<typeof createShipmentSchema>;
export type AddCheckpointDto = z.infer<typeof addCheckpointSchema>;
