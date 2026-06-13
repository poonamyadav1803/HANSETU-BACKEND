import { z } from "zod";

export const submitRfqSchema = z.object({
  productName: z.string().min(2, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().default("units"),
  deliveryLocation: z.string().min(3, "Delivery location is required"),
  requiredBy: z.string().optional(),
  specs: z.string().optional(),
  orderType: z.enum(["SAMPLE", "BULK"]).default("BULK"),
  requestType: z.enum(["PRODUCT_CATALOGUE", "COMPONENT_MANUFACTURER"]).default("PRODUCT_CATALOGUE"),
});

// Admin assigns a supplier/manufacturer and enters the offline-negotiated price
export const assignSchema = z.object({
  assigneeUserId: z.string().uuid("A valid user ID is required"),
  negotiatedPrice: z.coerce.number().positive("Negotiated price is required"),
  adminMarginPct: z.coerce.number().min(0).max(100).default(10),
  internalNotes: z.string().max(5000).optional(),
});

// Admin approves the assignment → creates PO + Invoice
export const approveRfqSchema = z.object({
  hsnCode: z.string().max(20).optional(),
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
