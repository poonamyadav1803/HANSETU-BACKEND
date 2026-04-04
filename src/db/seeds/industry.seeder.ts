/**
 * Industry Seeder
 *
 * Seeds the industries reference table. These map to the industry pages
 * in the frontend (aerospace, automobile, construction, etc.).
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import { industries, InsertIndustry } from "../schema";
import { log } from "../../utils/logger";

const industryData: InsertIndustry[] = [
  { slug: "aerospace",         name: "Aerospace",                description: "Aerospace manufacturing and components",               isActive: true },
  { slug: "automobile",        name: "Automobile",               description: "Automotive parts and manufacturing equipment",          isActive: true },
  { slug: "construction",      name: "Construction",             description: "Construction equipment and building materials",         isActive: true },
  { slug: "electric",          name: "Electric",                 description: "Electric systems and power distribution",               isActive: true },
  { slug: "electronics",       name: "Electronics",              description: "Electronic components and PCB manufacturing",           isActive: true },
  { slug: "healthcare",        name: "Healthcare",               description: "Medical equipment and healthcare manufacturing",        isActive: true },
  { slug: "medical",           name: "Medical",                  description: "Medical devices and precision instruments",             isActive: true },
  { slug: "space",             name: "Space",                    description: "Space technology and satellite components",             isActive: true },
  { slug: "raw-materials",     name: "Raw Materials",            description: "Industrial raw materials and bulk commodities",         isActive: true },
  { slug: "human-resource",    name: "Human Resource",           description: "HR services and workforce management solutions",        isActive: true },
  { slug: "garage",            name: "Garage & Workshop",        description: "Garage equipment and workshop tools",                   isActive: true },
  { slug: "accidental-vehicle",name: "Accidental Vehicle Parts", description: "Used, refurbished, and accidental vehicle spare parts", isActive: true },
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
