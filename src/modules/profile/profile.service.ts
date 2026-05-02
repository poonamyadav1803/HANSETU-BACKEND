import { HttpException } from "../../core/HttpException";
import { UserRepository } from "../user/user.repository";
import { UserProfile } from "../user/user.entity";

function normalizeCertifications(value?: string[] | string) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export interface CompleteProfileInput {
  service: "manufacturing" | "raw_material_supply";
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
  companyName?: string;
  addresses?: UserProfile["addresses"];
  description?: string;
  certifications?: string[] | string;
  existingClients?: string;
}

export class ProfileService {
  constructor(private readonly userRepo: UserRepository) {}

  async getStatus(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new HttpException(404, "User not found.");

    return {
      registrationComplete: user.registrationComplete,
      businessType: user.businessType,
      recommendedPath: user.registrationComplete
        ? user.businessType === "raw_material_supplier"
          ? "/dashboard/supplier"
          : "/dashboard/manufacturer"
        : "/complete-registration",
      profile: user.profile ?? null,
    };
  }

  async complete(userId: string, input: CompleteProfileInput) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new HttpException(404, "User not found.");

    const profile: UserProfile = {
      ...(user.profile ?? {}),
      companyName: input.companyName ?? user.profile?.companyName,
      addresses: input.addresses ?? user.profile?.addresses,
      description: input.description ?? user.profile?.description,
      existingClients: input.existingClients ?? user.profile?.existingClients,
      certifications: normalizeCertifications(input.certifications),
      service: input.service,
      industriesServed: input.industriesServed ?? [],
      rawMaterialCategories: input.rawMaterialCategories ?? [],
      materialCategories: input.materialCategories ?? {},
      supplyCapacity: input.supplyCapacity ?? "",
      manufacturingCapabilities: input.manufacturingCapabilities ?? [],
      capabilitySpecs: (input.capabilitySpecs ?? {}) as Record<string, Record<string, string | string[]>>,
      manufacturerIndustries: input.manufacturerIndustries ?? [],
      industrySelections: input.industrySelections ?? {},
      industryPartsPrefs: input.industryPartsPrefs ?? {},
      productionCapacity: input.productionCapacity ?? "",
      profileComplete: true,
      wizardCompletedAt: new Date().toISOString(),
      industries:
        input.service === "raw_material_supply"
          ? input.industriesServed ?? []
          : input.manufacturerIndustries ?? [],
      materialTypes: [
        ...(input.rawMaterialCategories ?? []),
        ...Object.values(input.materialCategories ?? {}).flat(),
      ],
      manufacturingProcesses: (input.manufacturingCapabilities ?? []).join(", "),
      rawMaterialProducts: Object.values(input.materialCategories ?? {}).flat(),
      targetIndustries:
        input.service === "raw_material_supply"
          ? input.industriesServed ?? []
          : input.manufacturerIndustries ?? [],
      manufacturingProductsFlat: Object.values(input.industrySelections ?? {}).flat(),
    };

    await this.userRepo.updateProfile(userId, profile, {
      registrationComplete: true,
      profileCompletedAt: new Date(),
    });

    const updated = await this.userRepo.findById(userId);
    if (!updated) throw new HttpException(404, "User not found.");
    const { password, ...safeUser } = updated;

    return {
      registrationComplete: updated.registrationComplete,
      user: safeUser,
    };
  }
}
