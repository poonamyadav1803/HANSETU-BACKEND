export type BusinessType =
  | "manufacturer"
  | "raw_material_supplier"
  | "both";

export type UserRole = "user" | "admin";

export interface UserProfile {
  industries?: string[];
  materialTypes?: string[];
  machinesAvailable?: string;
  machineSpecs?: string;
  manufacturingProcesses?: string;
  productionCapacity?: string;
  supplyCapacity?: string;
  certifications?: string;
  existingClients?: string;
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
  profile?: UserProfile | null;
  createdAt: Date;
  updatedAt: Date;
}