import { z } from 'zod';

export const createSubcategorySchema = z.object({
  categoryId: z.string().uuid('categoryId must be a valid UUID'),
  name: z.string().trim().min(1, 'Name is required').max(255),
});

export const updateSubcategorySchema = z
  .object({
    categoryId: z.string().uuid('categoryId must be a valid UUID').optional(),
    name: z.string().trim().min(1, 'Name is required').max(255).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required for update',
  });

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
