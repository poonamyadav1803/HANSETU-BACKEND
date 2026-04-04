export type BusinessType =
  | "manufacturer"
  | "raw_material_supplier"
  | "both";

export interface IUser {
  id: string;
  gstNumber: string;
  email: string;
  mobile: string;
  username: string;
  password: string;
  businessType: BusinessType;
  emailVerified: boolean;
  mobileVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}