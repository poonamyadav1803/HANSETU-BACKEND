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

export type SubmitRfqDto = z.infer<typeof submitRfqSchema>;
