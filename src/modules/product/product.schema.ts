import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url(),
  key: z.string().optional(),
  bucket: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().min(0).optional(),
  originalName: z.string().optional(),
});

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
  images: z.array(productImageSchema).nullable().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const createProductSchema = productBaseSchema;

export const updateProductSchema = productBaseSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "At least one field is required"
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
