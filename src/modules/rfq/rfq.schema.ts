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
});

export const assignSupplierSchema = z.object({
  supplierUserId: z.string().uuid("A valid supplier user ID is required"),
  adminMarginPct: z.coerce
    .number()
    .min(0, "Margin cannot be negative")
    .max(100, "Margin cannot exceed 100%"),
  adminOfferedPrice: z.coerce.number().positive("Offered price must be positive").optional(),
  internalNotes: z.string().max(5000, "Notes are too long").optional(),
});

export type SubmitRfqDto = z.infer<typeof submitRfqSchema>;
export type AssignSupplierDto = z.infer<typeof assignSupplierSchema>;
