import { BaseService } from "../../core/BaseService";
import {
  ManufacturerFilters,
  ManufacturerRepository,
} from "./manufacturer.repository";
import { UserRepository } from "../user/user.repository";
import { RawMaterialOrderRepository } from "../raw-material-order/raw-material-order.repository";
import { db } from "../../db";
import { rawMaterials, users } from "../../db/schema";
import { eq, or } from "drizzle-orm";

const userRepo = new UserRepository();
const orderRepo = new RawMaterialOrderRepository();

export class ManufacturerService extends BaseService {
  constructor(private repo: ManufacturerRepository) {
    super();
  }

  async getAll(filters: ManufacturerFilters) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Manufacturer not found");
    return this.parseJsonFields(row!);
  }

  async getDashboardStats(userId: string) {
    const [user, supplierUserRows, rawMaterialRows, orders] = await Promise.all([
      userRepo.findById(userId),
      // Count real registered supplier users (not catalog seed data)
      db
        .select({ id: users.id })
        .from(users)
        .where(
          or(
            eq(users.businessType, "raw_material_supplier"),
            eq(users.businessType, "both")
          )
        ),
      db.select({ id: rawMaterials.id }).from(rawMaterials).where(eq(rawMaterials.isActive, true)),
      orderRepo.findByManufacturer(userId),
    ]);

    const profile = (user?.profile as Record<string, unknown>) ?? {};
    const certifications = Array.isArray(profile.certifications)
      ? profile.certifications
      : typeof profile.certifications === "string"
      ? (profile.certifications as string).split(",").map((c) => c.trim()).filter(Boolean)
      : [];
    const capabilities = Array.isArray(profile.manufacturingCapabilities)
      ? profile.manufacturingCapabilities
      : [];
    const products = Array.isArray(profile.manufacturingProductsFlat)
      ? profile.manufacturingProductsFlat
      : [];
    const targetIndustries = Array.isArray(profile.targetIndustries)
      ? profile.targetIndustries
      : [];

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const acceptedOrders = orders.filter((o) => o.status === "accepted").length;
    const totalOrders = orders.length;

    return {
      availableSuppliersCount: supplierUserRows.length,
      availableRawMaterialsCount: rawMaterialRows.length,
      certificationCount: certifications.length,
      capabilitiesCount: (capabilities as unknown[]).length,
      productsCount: (products as unknown[]).length,
      targetIndustriesCount: (targetIndustries as unknown[]).length,
      productionCapacity: (profile.productionCapacity as string) ?? null,
      totalOrders,
      pendingOrders,
      acceptedOrders,
    };
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      certifications: row.certifications
        ? JSON.parse(row.certifications as string)
        : [],
      machineCapabilities: row.machineCapabilities
        ? JSON.parse(row.machineCapabilities as string)
        : [],
    };
  }
}
