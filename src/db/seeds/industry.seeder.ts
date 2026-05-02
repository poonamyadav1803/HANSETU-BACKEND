/**
 * Industry Seeder
 *
 * Seeds the industries reference table. These map to the industry pages
 * in the frontend (aerospace, automobile, construction, etc.).
 * The wizard-navigation seeder also upserts industries from INDUSTRY_CATEGORIES,
 * so this seeder acts as the authoritative baseline run first.
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import { industries, InsertIndustry } from "../schema";
import { log } from "../../utils/logger";

const industryData: InsertIndustry[] = [
  // ── Core platform industries ──────────────────────────────────────────────
  { slug: "automobile",         name: "Automobile",               description: "Automotive parts and manufacturing equipment",          icon: "directions_car",    isActive: true },
  { slug: "aerospace",          name: "Aerospace",                description: "Aerospace manufacturing and components",               icon: "flight",            isActive: true },
  { slug: "construction",       name: "Construction",             description: "Construction equipment and building materials",         icon: "construction",      isActive: true },
  { slug: "electric",           name: "Electric",                 description: "Electric systems and power distribution",               icon: "bolt",              isActive: true },
  { slug: "electronics",        name: "Electronics",              description: "Electronic components and PCB manufacturing",           icon: "memory",            isActive: true },
  { slug: "healthcare",         name: "Healthcare",               description: "Medical equipment and healthcare manufacturing",        icon: "healing",           isActive: true },
  { slug: "medical",            name: "Medical",                  description: "Medical devices and precision instruments",             icon: "medical_services",  isActive: true },
  { slug: "space",              name: "Space",                    description: "Space technology and satellite components",             icon: "rocket_launch",     isActive: true },
  { slug: "defence",            name: "Defence",                  description: "Defence systems and security manufacturing",            icon: "security",          isActive: true },
  { slug: "raw-materials",      name: "Raw Materials",            description: "Industrial raw materials and bulk commodities",         icon: "category",          isActive: true },
  { slug: "human-resource",     name: "Human Resource",           description: "HR services and workforce management solutions",        icon: "people",            isActive: true },
  { slug: "garage",             name: "Garage & Workshop",        description: "Garage equipment and workshop tools",                   icon: "build",             isActive: true },
  { slug: "accidental-vehicle", name: "Accidental Vehicle Parts", description: "Used, refurbished, and accidental vehicle spare parts", icon: "car_crash",         isActive: true },

  // ── Extended industries (from seedWizardData / INDUSTRY_CATEGORIES) ───────
  { slug: "marine",             name: "Marine",                   description: "Marine vessels and offshore equipment",                 icon: "directions_boat",   isActive: true },
  { slug: "energy-power",       name: "Energy & Power",           description: "Power generation, renewable energy and utilities",      icon: "electrical_services", isActive: true },
  { slug: "railways",           name: "Railways",                 description: "Rolling stock, track infrastructure and signalling",    icon: "train",             isActive: true },
  { slug: "oil-gas",            name: "Oil & Gas",                description: "Upstream and downstream petroleum equipment",           icon: "local_gas_station", isActive: true },
  { slug: "pharmaceutical",     name: "Pharmaceutical",           description: "Pharmaceutical manufacturing and drug production",      icon: "medication",        isActive: true },
  { slug: "chemical",           name: "Chemical",                 description: "Industrial chemicals and process manufacturing",        icon: "science",           isActive: true },
  { slug: "polymer",            name: "Polymer",                  description: "Polymer processing and plastics manufacturing",         icon: "bubble_chart",      isActive: true },
  { slug: "medical-devices",    name: "Medical Devices",          description: "Diagnostic and surgical medical device manufacturing",  icon: "biotech",           isActive: true },
  { slug: "textile",            name: "Textile & Apparel",        description: "Textile spinning, weaving and apparel manufacturing",   icon: "checkroom",         isActive: true },
  { slug: "food-processing",    name: "Food Processing",          description: "Food and beverage processing and packaging",            icon: "restaurant",        isActive: true },
  { slug: "agriculture",        name: "Agriculture",              description: "Agro-processing, farm equipment and crop inputs",       icon: "agriculture",       isActive: true },
  { slug: "mining-minerals",    name: "Mining & Minerals",        description: "Mining equipment and mineral processing",               icon: "landslide",         isActive: true },
  { slug: "rubber-elastomers",  name: "Rubber & Elastomers",      description: "Natural and synthetic rubber products",                 icon: "donut_large",       isActive: true },
  { slug: "paints-coatings",    name: "Paints & Coatings",        description: "Industrial paints, pigments and surface coatings",      icon: "format_paint",      isActive: true },
  { slug: "packaging",          name: "Packaging",                description: "Flexible, rigid and industrial packaging solutions",    icon: "inventory_2",       isActive: true },
  { slug: "paper-print",        name: "Paper & Print",            description: "Paper manufacturing and commercial printing",           icon: "article",           isActive: true },
  { slug: "glass-ceramics",     name: "Glass & Ceramics",         description: "Glass, ceramics and refractory products",              icon: "wine_bar",          isActive: true },
];

export async function seedIndustries(): Promise<void> {
  log("Seeding industries...");

  for (const industry of industryData) {
    const [existing] = await db
      .select()
      .from(industries)
      .where(eq(industries.slug, industry.slug));

    if (existing) {
      log(`  Industry already exists: ${industry.slug}`);
      continue;
    }

    await db.insert(industries).values(industry);
    log(`  Created industry: ${industry.slug}`);
  }

  log(`Industries seeding complete. (${industryData.length} records)`);
}
