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

export interface WizardPartsSel {
  item: string[];
  grade: string[];
  shape: string[];
  fabrication: string[];
}

export interface UserProfile {
  // ── Contact & Company ──────────────────────────────────────────────────────
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
  certifications?: string[] | string;
  existingClients?: string;

  // ── Services ───────────────────────────────────────────────────────────────
  services?: string[];

  // ── Manufacturing ──────────────────────────────────────────────────────────
  manufacturingCapabilities?: string[];
  capabilitySpecs?: Record<string, Record<string, string | string[]>>;
  manufacturingProducts?: Record<string, Record<string, string[]>>;
  manufacturingProductsFlat?: string[];
  productionCapacity?: string;

  // ── Manufacturing target industries ───────────────────────────────────────
  targetIndustries?: string[];
  industryPartsSelections?: Record<string, WizardPartsSel>;

  // ── Raw Material Supply ────────────────────────────────────────────────────
  rawMaterialCategories?: string[];
  rawMaterialSelections?: Record<string, string[]>;
  rawMaterialProducts?: string[];
  supplyCapacity?: string;

  // ── Raw supply target industries ───────────────────────────────────────────
  rawTargetIndustries?: string[];
  rawIndustrySelections?: Record<string, Record<string, string[]>>;

  // ── Wizard metadata ────────────────────────────────────────────────────────
  profileComplete?: boolean;
  wizardCompletedAt?: string;

  // ── Legacy / backward-compatible fields ───────────────────────────────────
  service?: "manufacturing" | "raw_material_supply";
  industriesServed?: string[];
  materialCategories?: Record<string, string[]>;
  manufacturerIndustries?: string[];
  industrySelections?: Record<string, string[]>;
  industryPartsPrefs?: Record<string, Record<string, unknown>>;
  industries?: string[];
  materialTypes?: string[];
  machinesAvailable?: string;
  machineSpecs?: string;
  manufacturingProcesses?: string;
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
