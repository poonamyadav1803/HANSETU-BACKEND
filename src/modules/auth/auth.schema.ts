import { z } from "zod";

export const signupSchema = z.object({
  gstNumber: z.string().min(15).max(20),
  email: z.string().email(),
  mobile: z.string().min(10).max(15),
  username: z.string().min(3).max(100),
  password: z.string().min(8),
  businessType: z.enum(["manufacturer", "raw_material_supplier", "both"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
