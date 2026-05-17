import { BaseService } from "../../core/BaseService";
import { SupplierRepository } from "./supplier.repository";
import { UserRepository } from "../user/user.repository";
import { SupplierInventoryRepository } from "../supplier-inventory/supplier-inventory.repository";
import { SupplierTransactionRepository } from "../supplier-transaction/supplier-transaction.repository";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, or } from "drizzle-orm";

const userRepo = new UserRepository();
const inventoryRepo = new SupplierInventoryRepository();
const transactionRepo = new SupplierTransactionRepository();

export class SupplierService extends BaseService {
  constructor(private repo: SupplierRepository) {
    super();
  }

  async getAll(filters: { industrySlug?: string; materialCategory?: string }) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseJsonFields);
  }

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("Supplier not found");
    return this.parseJsonFields(row!);
  }

  async getDashboardStats(userId: string) {
    const [user, manufacturerUserRows, inventory, transactions] = await Promise.all([
      userRepo.findById(userId),
      // Count real registered manufacturer users (not catalog seed data)
      db
        .select({ id: users.id })
        .from(users)
        .where(
          or(
            eq(users.businessType, "manufacturer"),
            eq(users.businessType, "both")
          )
        ),
      inventoryRepo.findBySupplier(userId),
      transactionRepo.findBySupplier(userId),
    ]);

    const profile = (user?.profile as Record<string, unknown>) ?? {};
    const categories = Array.isArray(profile.rawMaterialCategories)
      ? (profile.rawMaterialCategories as string[])
      : [];
    const selections = (profile.rawMaterialSelections ?? {}) as Record<string, string[]>;
    const variantsCount = Object.values(selections).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    const industries = Array.isArray(profile.rawTargetIndustries)
      ? (profile.rawTargetIndustries as string[])
      : Array.isArray(profile.industriesServed)
      ? (profile.industriesServed as string[])
      : [];

    const stockItemsCount = inventory.filter((i) => i.status !== "out_of_stock").length;
    const lowStockCount = inventory.filter((i) => i.status === "low_stock").length;
    const outOfStockCount = inventory.filter((i) => i.status === "out_of_stock").length;
    const pendingPayments = transactions.filter(
      (t) => t.status === "pending" || t.status === "overdue"
    ).length;
    const overduePayments = transactions.filter((t) => t.status === "overdue").length;
    const distinctBuyers = new Set(transactions.map((t) => t.buyerName)).size;

    return {
      activeManufacturersCount: manufacturerUserRows.length,
      materialCategoriesCount: categories.length,
      productVariantsCount: variantsCount,
      industriesServedCount: industries.length,
      supplyCapacity: (profile.supplyCapacity as string) ?? null,
      stockItemsCount,
      lowStockCount,
      outOfStockCount,
      pendingPayments,
      overduePayments,
      distinctBuyers,
      totalInventoryItems: inventory.length,
      totalTransactions: transactions.length,
    };
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      materials: row.materials ? JSON.parse(row.materials as string) : [],
      certifications: row.certifications ? JSON.parse(row.certifications as string) : [],
    };
  }
}
