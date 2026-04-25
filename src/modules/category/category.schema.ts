import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value.length === 0 ? null : value;
    });

const subcategoryNamesSchema = z
  .array(z.string().trim().min(1, "Subcategory name is required").max(255))
  .optional();

export const createCategorySchema = z.object({
  slug: z.string().trim().min(1, "Slug is required").max(100),
  name: z.string().trim().min(1, "Name is required").max(255),
  description: optionalTrimmedString(5000),
  primaryColor: optionalTrimmedString(200),
  secondaryColor: optionalTrimmedString(200),
  gradientColor: optionalTrimmedString(200),
  badgeColor: optionalTrimmedString(200),
  isActive: z.boolean().optional(),
  subcategories: subcategoryNamesSchema,
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update",
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
