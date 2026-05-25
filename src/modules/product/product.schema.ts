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
  industryId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  subcategoryId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(500),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  materialType: z.string().trim().max(255).nullable().optional(),
  grade: z.string().trim().max(255).nullable().optional(),
  specifications: z.record(z.string()).nullable().optional(),
  moq: z.number().int().positive().nullable().optional(),
  leadTime: z.string().trim().max(100).nullable().optional(),
  price: z.union([z.string().trim().min(1), z.number()]).nullable().optional(),
  originalPrice: z.union([z.string().trim().min(1), z.number()]).nullable().optional(),
  brand: z.string().trim().max(255).nullable().optional(),
  samplesAvailable: z.boolean().optional(),
  inStock: z.boolean().optional(),
  rating: z.union([z.string().trim().min(1), z.number()]).optional(),
  reviews: z.number().int().min(0).optional(),
  images: z.array(productImageSchema).nullable().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const createProductSchema = productBaseSchema.refine(
  (payload) => Boolean(payload.name),
  { message: "name is required" }
);

export const updateProductSchema = productBaseSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "At least one field is required"
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
