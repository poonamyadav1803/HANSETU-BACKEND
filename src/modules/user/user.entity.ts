export type BusinessType =
  | "manufacturer"
  | "raw_material_supplier"
  | "both";

export type UserRole = "user" | "admin";

export interface WizardAddress {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  designation?: string;
  phone?: string;
  companyName?: string;
  yearEstablished?: string;
  totalEmployees?: string;
  website?: string;
  addresses?: WizardAddress[];
  description?: string;
  service?: "manufacturing" | "raw_material_supply";
  industriesServed?: string[];
  rawMaterialCategories?: string[];
  materialCategories?: Record<string, string[]>;
  supplyCapacity?: string;
  manufacturingCapabilities?: string[];
  capabilitySpecs?: Record<string, Record<string, unknown>>;
  manufacturerIndustries?: string[];
  industrySelections?: Record<string, string[]>;
  industryPartsPrefs?: Record<string, Record<string, unknown>>;
  productionCapacity?: string;
  certifications?: string[] | string;
  existingClients?: string;
  profileComplete?: boolean;
  wizardCompletedAt?: string;

  // Backward-compatible fields still read by some older pages.
  industries?: string[];
  materialTypes?: string[];
  machinesAvailable?: string;
  machineSpecs?: string;
  manufacturingProcesses?: string;
  rawMaterialProducts?: string[];
  targetIndustries?: string[];
  manufacturingProducts?: string[];
}

export interface IUser {
  id: string;
  gstNumber: string;
  email: string;
  mobile: string;
  username: string;
  password: string;
  businessType: BusinessType;
  role: UserRole;
  emailVerified: boolean;
  mobileVerified: boolean;
  isActive: boolean;
  registrationComplete: boolean;
  profile?: UserProfile | null;
  profileCompletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
