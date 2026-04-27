import { db } from "../index";
import {
  industries,
  navRawMaterialCategories,
  wizardBusinessServices,
  wizardIndustryCategories,
  wizardIndustryPartsFilters,
  wizardIndustryRawMaterialMap,
  wizardManufacturingCapabilities,
  wizardManufacturingProductCategories,
  wizardRawMaterialCategories,
} from "../schema";
import {
  BUSINESS_SERVICES,
  INDUSTRY_CATEGORIES,
  INDUSTRY_PARTS_FILTERS,
  INDUSTRY_RAW_MATERIAL_MAP,
  MANUFACTURING_CAPABILITIES,
  MANUFACTURING_PRODUCT_CATEGORIES,
  RAW_MATERIAL_CATEGORIES,
} from "../../data/wizardData";
import { log } from "../../utils/logger";

const RAW_MATERIAL_GROUPS: Record<string, string> = {
  steel: "Metals & Alloys",
  aluminum: "Metals & Alloys",
  copper: "Metals & Alloys",
  metals: "Metals & Alloys",
  plastics: "Polymers & Rubber",
  rubber: "Polymers & Rubber",
  composites: "Polymers & Rubber",
  chemicals: "Chemicals & Petrochemicals",
  petrochemicals: "Chemicals & Petrochemicals",
  paints-pigments: "Chemicals & Petrochemicals",
  adhesives: "Chemicals & Petrochemicals",
  welding-gases: "Chemicals & Petrochemicals",
  abrasives: "Industrial Consumables",
  electronics: "Electronics & Electrical",
  energy: "Electronics & Electrical",
  construction: "Construction & Infrastructure",
  minerals: "Construction & Infrastructure",
  glass: "Construction & Infrastructure",
  wood: "Packaging, Paper & Wood",
  paper: "Packaging, Paper & Wood",
  packaging: "Packaging, Paper & Wood",
  textiles: "Textiles, Agro & Specialty",
  agro: "Textiles, Agro & Specialty",
  pharma: "Textiles, Agro & Specialty",
  "food-ingredients": "Textiles, Agro & Specialty",
};

const INDUSTRY_ICON_MAP: Record<string, string> = {
  automobile: "directions_car",
  aerospace: "flight",
  construction: "construction",
  electronics: "memory",
  healthcare: "healing",
  chemical: "science",
  polymer: "bubble_chart",
  space: "rocket_launch",
  defence: "security",
  textile: "checkroom",
  pharmaceutical: "medication",
  packaging: "inventory_2",
};

export async function seedWizardNavigationData() {
  log("Seeding wizard and navigation data...");

  for (const service of BUSINESS_SERVICES) {
    await db
      .insert(wizardBusinessServices)
      .values({
        slug: service.id,
        name: service.name,
        description: service.description,
        icon: service.icon,
        sortOrder: service.sort_order,
      })
      .onConflictDoUpdate({
        target: wizardBusinessServices.slug,
        set: {
          name: service.name,
          description: service.description,
          icon: service.icon,
          sortOrder: service.sort_order,
          updatedAt: new Date(),
        },
      });
  }

  for (const category of RAW_MATERIAL_CATEGORIES) {
    await db
      .insert(wizardRawMaterialCategories)
      .values({
        slug: category.id,
        name: category.name,
        sortOrder: category.sort_order,
        subcategories: category.subcategories,
      })
      .onConflictDoUpdate({
        target: wizardRawMaterialCategories.slug,
        set: {
          name: category.name,
          sortOrder: category.sort_order,
          subcategories: category.subcategories,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(navRawMaterialCategories)
      .values({
        slug: category.id,
        name: category.name,
        icon: null,
        groupName: RAW_MATERIAL_GROUPS[category.id] ?? "Other Materials",
        subcategories: category.subcategories,
      })
      .onConflictDoUpdate({
        target: navRawMaterialCategories.slug,
        set: {
          name: category.name,
          groupName: RAW_MATERIAL_GROUPS[category.id] ?? "Other Materials",
          subcategories: category.subcategories,
          updatedAt: new Date(),
        },
      });
  }

  for (const [industrySlug, value] of Object.entries(INDUSTRY_RAW_MATERIAL_MAP)) {
    await db
      .insert(wizardIndustryRawMaterialMap)
      .values({
        industrySlug,
        rawCategorySlugs: value.rawCatIds,
        emoji: value.emoji,
        sampleTags: value.sampleTags,
      })
      .onConflictDoUpdate({
        target: wizardIndustryRawMaterialMap.industrySlug,
        set: {
          rawCategorySlugs: value.rawCatIds,
          emoji: value.emoji,
          sampleTags: value.sampleTags,
          updatedAt: new Date(),
        },
      });
  }

  for (const capability of MANUFACTURING_CAPABILITIES) {
    await db
      .insert(wizardManufacturingCapabilities)
      .values({
        slug: capability.id,
        name: capability.name,
        description: capability.description,
        sortOrder: capability.sort_order,
        parameters: capability.parameters,
      })
      .onConflictDoUpdate({
        target: wizardManufacturingCapabilities.slug,
        set: {
          name: capability.name,
          description: capability.description,
          sortOrder: capability.sort_order,
          parameters: capability.parameters,
          updatedAt: new Date(),
        },
      });
  }

  for (const item of MANUFACTURING_PRODUCT_CATEGORIES) {
    await db
      .insert(wizardManufacturingProductCategories)
      .values({
        industrySlug: item.id,
        categories: item.categories,
      })
      .onConflictDoUpdate({
        target: wizardManufacturingProductCategories.industrySlug,
        set: {
          categories: item.categories,
          updatedAt: new Date(),
        },
      });
  }

  for (const item of INDUSTRY_CATEGORIES) {
    await db
      .insert(wizardIndustryCategories)
      .values({
        industrySlug: item.id,
        name: item.name,
        emoji: item.emoji,
        sortOrder: item.sort_order,
        categories: item.categories,
      })
      .onConflictDoUpdate({
        target: wizardIndustryCategories.industrySlug,
        set: {
          name: item.name,
          emoji: item.emoji,
          sortOrder: item.sort_order,
          categories: item.categories,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(industries)
      .values({
        slug: item.id,
        name: item.name,
        icon: INDUSTRY_ICON_MAP[item.id] ?? null,
      })
      .onConflictDoUpdate({
        target: industries.slug,
        set: {
          name: item.name,
          icon: INDUSTRY_ICON_MAP[item.id] ?? null,
        },
      });
  }

  for (const [industrySlug, filterValues] of Object.entries(INDUSTRY_PARTS_FILTERS)) {
    await db
      .insert(wizardIndustryPartsFilters)
      .values({
        industrySlug,
        item: filterValues.item ?? [],
        grade: filterValues.grade ?? [],
        shape: filterValues.shape ?? [],
        fabrication: filterValues.fabrication ?? [],
      })
      .onConflictDoUpdate({
        target: wizardIndustryPartsFilters.industrySlug,
        set: {
          item: filterValues.item ?? [],
          grade: filterValues.grade ?? [],
          shape: filterValues.shape ?? [],
          fabrication: filterValues.fabrication ?? [],
          updatedAt: new Date(),
        },
      });
  }
}
