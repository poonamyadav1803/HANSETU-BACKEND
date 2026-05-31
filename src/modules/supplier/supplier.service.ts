import { BaseService } from "../../core/BaseService";
import { SupplierRepository } from "./supplier.repository";
import { UserRepository } from "../user/user.repository";
import { SupplierInventoryRepository } from "../supplier-inventory/supplier-inventory.repository";
import { SupplierTransactionRepository } from "../supplier-transaction/supplier-transaction.repository";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, or } from "drizzle-orm";
import type { UserProfile } from "../user/user.entity";

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

  async searchForAdmin(filters: {
    query?: string;
    category?: string;
    capability?: string;
    location?: string;
    certification?: string;
    moqLte?: number;
  }) {
    const rows = await this.repo.findRegisteredSuppliers();
    const queryTokens = this.tokenize(filters.query);
    const categoryTokens = this.tokenize(filters.category);
    const capabilityTokens = this.tokenize(filters.capability);
    const locationTokens = this.tokenize(filters.location);
    const certificationTokens = this.tokenize(filters.certification);

    const results = rows
      .map((row) => {
        const profile = (row.profile as UserProfile | null) ?? null;
        const supplier = this.buildSearchDocument(row, profile);
        const score = this.computeScore(supplier, {
          queryTokens,
          categoryTokens,
          capabilityTokens,
          locationTokens,
          certificationTokens,
          moqLte: filters.moqLte,
        });

        return {
          ...supplier,
          matchScore: score.score,
          matchReasons: score.reasons,
        };
      })
      .filter((supplier) => {
        if (filters.query && supplier.matchScore <= 0) return false;
        if (categoryTokens.length && !this.matchesAll(categoryTokens, supplier.categoryTags)) return false;
        if (capabilityTokens.length && !this.matchesAny(capabilityTokens, supplier.capabilityTags)) return false;
        if (locationTokens.length && !this.matchesAny(locationTokens, supplier.locationTags)) return false;
        if (certificationTokens.length && !this.matchesAny(certificationTokens, supplier.certificationTags)) return false;
        if (filters.moqLte != null && supplier.moqValue != null && supplier.moqValue > filters.moqLte) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return a.companyName.localeCompare(b.companyName);
      });

    return results;
  }

  private parseJsonFields(row: Record<string, unknown>) {
    return {
      ...row,
      materials: row.materials ? JSON.parse(row.materials as string) : [],
      certifications: row.certifications ? JSON.parse(row.certifications as string) : [],
    };
  }

  private buildSearchDocument(
    row: {
      id: string;
      email: string;
      username: string;
      businessType: string;
      isActive: boolean | null;
      profile: unknown;
      createdAt: Date | null;
    },
    profile: UserProfile | null
  ) {
    const addresses = Array.isArray(profile?.addresses) ? profile?.addresses ?? [] : [];
    const categoryTags = this.uniqueStrings([
      ...(profile?.rawMaterialCategories ?? []),
      ...Object.keys(profile?.rawMaterialSelections ?? {}),
      ...(profile?.materialTypes ?? []),
    ]);
    const capabilityTags = this.uniqueStrings([
      ...(profile?.rawMaterialProducts ?? []),
      ...Object.values(profile?.rawMaterialSelections ?? {}).flat(),
      ...(profile?.manufacturingCapabilities ?? []),
    ]);
    const certificationTags = this.uniqueStrings([
      ...(Array.isArray(profile?.certifications)
        ? profile?.certifications
        : typeof profile?.certifications === "string"
        ? profile.certifications.split(",")
        : []),
    ]);
    const locationParts = this.uniqueStrings([
      ...addresses.flatMap((address) => [address.city, address.state, address.postalCode]),
      ...(profile?.rawTargetIndustries ?? []),
      ...(profile?.industriesServed ?? []),
    ]);

    return {
      id: row.id,
      email: row.email,
      username: row.username,
      companyName: profile?.companyName ?? profile?.tradeName ?? row.username,
      businessType: row.businessType,
      categoryTags,
      capabilityTags,
      locationTags: locationParts,
      certificationTags,
      moqValue: this.extractNumericValue(profile?.supplyCapacity),
      moqLabel: profile?.supplyCapacity ?? null,
      locations: addresses.map((address) =>
        [address.city, address.state, address.postalCode].filter(Boolean).join(", ")
      ),
      isVerified: Boolean(profile?.profileComplete),
      createdAt: row.createdAt,
    };
  }

  private computeScore(
    supplier: {
      companyName: string;
      username: string;
      categoryTags: string[];
      capabilityTags: string[];
      locationTags: string[];
      certificationTags: string[];
      moqValue: number | null;
    },
    filters: {
      queryTokens: string[];
      categoryTokens: string[];
      capabilityTokens: string[];
      locationTokens: string[];
      certificationTokens: string[];
      moqLte?: number;
    }
  ) {
    let score = 0;
    const reasons: string[] = [];

    const companyTokens = this.tokenize(`${supplier.companyName} ${supplier.username}`);

    const addIfMatched = (tokens: string[], haystack: string[], points: number, reason: string) => {
      if (tokens.length && this.matchesAny(tokens, haystack)) {
        score += points;
        reasons.push(reason);
      }
    };

    addIfMatched(filters.queryTokens, companyTokens, 5, "matched supplier name");
    addIfMatched(filters.queryTokens, supplier.categoryTags, 8, "matched category");
    addIfMatched(filters.queryTokens, supplier.capabilityTags, 8, "matched capability");
    addIfMatched(filters.categoryTokens, supplier.categoryTags, 15, "category compatible");
    addIfMatched(filters.capabilityTokens, supplier.capabilityTags, 15, "capability compatible");
    addIfMatched(filters.locationTokens, supplier.locationTags, 10, "location compatible");
    addIfMatched(filters.certificationTokens, supplier.certificationTags, 10, "certification compatible");

    if (filters.moqLte != null && supplier.moqValue != null && supplier.moqValue <= filters.moqLte) {
      score += 6;
      reasons.push("MOQ within requested range");
    }

    return { score, reasons: this.uniqueStrings(reasons) };
  }

  private matchesAny(tokens: string[], values: string[]) {
    if (!tokens.length) return true;
    const haystack = values.flatMap((value) => this.tokenize(value));
    return tokens.some((token) => haystack.includes(token));
  }

  private matchesAll(tokens: string[], values: string[]) {
    if (!tokens.length) return true;
    const haystack = values.flatMap((value) => this.tokenize(value));
    return tokens.every((token) => haystack.includes(token));
  }

  private tokenize(value?: string) {
    if (!value) return [];
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 2);
  }

  private uniqueStrings(values: Array<string | undefined>) {
    return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
  }

  private extractNumericValue(value?: string) {
    if (!value) return null;
    const match = value.match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
  }
}
