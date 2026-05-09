import { z } from "zod";

const productBaseSchema = z.object({
  manufacturerUserId: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(500),
  price: z.union([z.string().trim().min(1), z.number()]),
  originalPrice: z.union([z.string().trim().min(1), z.number()]).nullable().optional(),
  rating: z.union([z.string().trim().min(1), z.number()]).optional(),
  reviews: z.number().int().min(0).optional(),
  brand: z.string().trim().max(255).nullable().optional(),
  inStock: z.boolean().optional(),
  specs: z.union([z.record(z.unknown()), z.array(z.unknown()), z.string()]).nullable().optional(),
  description: z.string().nullable().optional(),
});

export const createProductSchema = productBaseSchema;

export const updateProductSchema = productBaseSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "At least one field is required"
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
