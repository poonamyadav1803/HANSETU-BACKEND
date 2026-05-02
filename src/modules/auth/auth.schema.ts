import { z } from 'zod';

export const signupSchema = z.object({
  gstNumber: z.string().min(15).max(20),
  email: z.string().email(),
  mobile: z.string().min(10).max(15),
  username: z.string().min(3).max(100),
  password: z.string().min(8),
  businessType: z.enum(['manufacturer', 'raw_material_supplier', 'both']),
  otpToken: z.string().min(1),
  industries: z.array(z.string()).optional(),
  materialTypes: z.array(z.string()).optional(),
  machinesAvailable: z.string().optional(),
  machineSpecs: z.string().optional(),
  manufacturingProcesses: z.string().optional(),
  productionCapacity: z.string().optional(),
  supplyCapacity: z.string().optional(),
  certifications: z.union([z.string(), z.array(z.string())]).optional(),
  existingClients: z.string().optional(),
});

// Accepts email address OR username
export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1),
});

export const gstVerifySchema = z.object({
  gstNumber: z
    .string()
    .min(15, 'GST number must be 15 characters')
    .max(20)
    .regex(
      /^[0-9A-Z]+$/,
      'GST number must contain only digits and uppercase letters',
    ),
});

export const sendPhoneOtpSchema = z.object({
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15)
    .regex(/^[+\d]+$/, 'Invalid mobile number format'),
});

export const verifyPhoneOtpSchema = z.object({
  mobile: z.string().min(10).max(15),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must be digits only'),
});

export const sendEmailOtpSchema = z.object({
  email: z.string().email(),
});

export const verifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must be digits only'),
});

const wizardAddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

const wizardPartsSelSchema = z.object({
  item: z.array(z.string()).default([]),
  grade: z.array(z.string()).default([]),
  shape: z.array(z.string()).default([]),
  fabrication: z.array(z.string()).default([]),
});

export const updateProfileSchema = z.object({
  // Contact & Company
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  yearEstablished: z.string().optional(),
  totalEmployees: z.string().optional(),
  website: z.string().optional(),
  addresses: z.array(wizardAddressSchema).optional(),
  description: z.string().optional(),
  certifications: z.union([z.string(), z.array(z.string())]).optional(),
  existingClients: z.string().optional(),

  // Services (multi-select)
  services: z.array(z.string()).optional(),

  // Manufacturing
  manufacturingCapabilities: z.array(z.string()).optional(),
  // capabilitySpecs: capSlug → { paramId → string | string[] }
  capabilitySpecs: z.record(z.record(z.union([z.string(), z.array(z.string())]))).optional(),
  // manufacturingProducts: industrySlug → categoryName → subcategoryNames[]
  manufacturingProducts: z.record(z.record(z.array(z.string()))).optional(),
  manufacturingProductsFlat: z.array(z.string()).optional(),
  productionCapacity: z.string().optional(),

  // Manufacturing target industries
  targetIndustries: z.array(z.string()).optional(),
  // industryPartsSelections: industrySlug → { item, grade, shape, fabrication }
  industryPartsSelections: z.record(wizardPartsSelSchema).optional(),

  // Raw Material Supply
  rawMaterialCategories: z.array(z.string()).optional(),
  // rawMaterialSelections: categorySlug → subcategoryNames[]
  rawMaterialSelections: z.record(z.array(z.string())).optional(),
  rawMaterialProducts: z.array(z.string()).optional(),
  supplyCapacity: z.string().optional(),

  // Raw supply target industries
  rawTargetIndustries: z.array(z.string()).optional(),
  // rawIndustrySelections: industrySlug → rawCategorySlug → subcategoryNames[]
  rawIndustrySelections: z.record(z.record(z.array(z.string()))).optional(),

  // Wizard metadata
  profileComplete: z.boolean().optional(),
  wizardCompletedAt: z.string().optional(),

  // Legacy fields (still accepted for backward compatibility)
  service: z.enum(['manufacturing', 'raw_material_supply']).optional(),
  industriesServed: z.array(z.string()).optional(),
  materialCategories: z.record(z.array(z.string())).optional(),
  manufacturerIndustries: z.array(z.string()).optional(),
  industrySelections: z.record(z.array(z.string())).optional(),
  industryPartsPrefs: z.record(z.record(z.unknown())).optional(),
  industries: z.array(z.string()).optional(),
  materialTypes: z.array(z.string()).optional(),
  machinesAvailable: z.string().optional(),
  machineSpecs: z.string().optional(),
  manufacturingProcesses: z.string().optional(),
});

export const completeRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  designation: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  addresses: z.array(wizardAddressSchema).optional(),
  yearEstablished: z.string().optional(),
  totalEmployees: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;
