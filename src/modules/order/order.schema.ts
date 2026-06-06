import { z } from "zod";

const advancePaymentSchema = z.object({
  amount: z.coerce.number().positive("Advance payment amount must be positive"),
  method: z.string().trim().min(1, "Advance payment method is required").max(50),
  reference: z.string().trim().min(1).max(255).optional(),
});

export const confirmOrderSchema = z.object({
  rfqId: z.string().uuid("A valid RFQ ID is required"),
  sourceType: z.enum(["ACCEPTED_QUOTE", "SAMPLE"]).default("ACCEPTED_QUOTE"),
  advancePayment: advancePaymentSchema.optional(),
  notes: z.string().trim().max(5000, "Notes are too long").optional(),
});

export const listOrdersQuerySchema = z.object({
  status: z.string().trim().min(1).optional(),
  sourceType: z.enum(["ACCEPTED_QUOTE", "SAMPLE"]).optional(),
  advancePaymentStatus: z.enum(["NOT_APPLICABLE", "RECORDED", "PENDING", "PAID", "FAILED"]).optional(),
  phase5DocumentStatus: z.enum(["TRIGGERED", "GENERATING", "GENERATED", "FAILED"]).optional(),
  rfqId: z.string().uuid().optional(),
  buyerId: z.string().uuid().optional(),
  orderNumber: z.string().trim().min(1).optional(),
  dateFrom: z.string().trim().min(1).optional(),
  dateTo: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const recordAdvancePaymentSchema = advancePaymentSchema.extend({
  status: z.enum(["RECORDED", "PENDING", "PAID", "FAILED"]).default("RECORDED"),
});

export const updatePhase5DocumentsSchema = z.object({
  status: z.enum(["TRIGGERED", "GENERATING", "GENERATED", "FAILED"]),
  documents: z.array(z.record(z.unknown())).default([]),
});

export type ConfirmOrderDto = z.infer<typeof confirmOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type RecordAdvancePaymentDto = z.infer<typeof recordAdvancePaymentSchema>;
export type UpdatePhase5DocumentsDto = z.infer<typeof updatePhase5DocumentsSchema>;
