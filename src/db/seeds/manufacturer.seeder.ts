/**
 * Manufacturer Seeder
 *
 * Seeds the manufacturers table with sample B2B manufacturer listings.
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import { manufacturers, InsertManufacturer } from "../schema";
import { log } from "../../utils/logger";

const manufacturerData: InsertManufacturer[] = [
  {
    industrySlug: "automobile",
    city: "Pune",
    state: "Maharashtra",
    totalEmployees: "500-1000",
    turnover: "$10M - $50M",
    yearEstablished: "1995",
    certifications: JSON.stringify(["ISO 9001", "TS 16949", "CE"]),
    inHouseTesting: true,
    importExport: true,
    responseTime: "24 hours",
    rating: "4.8",
    machineCapabilities: JSON.stringify(["CNC Milling", "CNC Turning", "Wire EDM", "Surface Grinding"]),
    isActive: true,
  },
  {
    industrySlug: "aerospace",
    city: "Bangalore",
    state: "Karnataka",
    totalEmployees: "100-500",
    turnover: "$5M - $10M",
    yearEstablished: "2005",
    certifications: JSON.stringify(["AS9100", "ISO 9001", "NADCAP"]),
    inHouseTesting: true,
    importExport: false,
    responseTime: "12 hours",
    rating: "4.9",
    machineCapabilities: JSON.stringify(["5-Axis CNC", "EDM", "CMM Inspection", "Heat Treatment"]),
    isActive: true,
  },
  {
    industrySlug: "military",
    city: "Chennai",
    state: "Tamil Nadu",
    totalEmployees: "1000+",
    turnover: "$50M+",
    yearEstablished: "1985",
    certifications: JSON.stringify(["ISO 9001", "ISO 14001", "OHSAS 18001"]),
    inHouseTesting: true,
    importExport: true,
    responseTime: "6 hours",
    rating: "5.0",
    machineCapabilities: JSON.stringify(["Heavy Machining", "Precision Grinding", "Assembly", "Testing"]),
    isActive: true,
  },
  {
    industrySlug: "electric",
    city: "Ahmedabad",
    state: "Gujarat",
    totalEmployees: "200-500",
    turnover: "$20M - $50M",
    yearEstablished: "2000",
    certifications: JSON.stringify(["ISO 9001", "BIS", "CE Mark"]),
    inHouseTesting: true,
    importExport: true,
    responseTime: "18 hours",
    rating: "4.7",
    machineCapabilities: JSON.stringify(["Winding", "Core Cutting", "Assembly", "Testing"]),
    isActive: true,
  },
  {
    industrySlug: "electronics",
    city: "Hyderabad",
    state: "Telangana",
    totalEmployees: "50-200",
    turnover: "$2M - $5M",
    yearEstablished: "2010",
    certifications: JSON.stringify(["ISO 9001", "RoHS", "CE"]),
    inHouseTesting: true,
    importExport: false,
    responseTime: "24 hours",
    rating: "4.6",
    machineCapabilities: JSON.stringify(["PCB Assembly", "SMT", "Wave Soldering", "Testing"]),
    isActive: true,
  },
  {
    industrySlug: "construction",
    city: "Delhi",
    state: "Delhi NCR",
    totalEmployees: "200-500",
    turnover: "$15M - $30M",
    yearEstablished: "1998",
    certifications: JSON.stringify(["ISO 9001", "ISI Mark", "BIS"]),
    inHouseTesting: false,
    importExport: false,
    responseTime: "48 hours",
    rating: "4.5",
    machineCapabilities: JSON.stringify(["Fabrication", "Welding", "Rolling", "Bending"]),
    isActive: true,
  },
  {
    industrySlug: "healthcare",
    city: "Mumbai",
    state: "Maharashtra",
    totalEmployees: "100-200",
    turnover: "$5M - $15M",
    yearEstablished: "2003",
    certifications: JSON.stringify(["ISO 13485", "CE", "FDA"]),
    inHouseTesting: true,
    importExport: true,
    responseTime: "12 hours",
    rating: "4.8",
    machineCapabilities: JSON.stringify(["Precision Machining", "Clean Room Assembly", "Sterilization"]),
    isActive: true,
  },
  {
    industrySlug: "medical",
    city: "Coimbatore",
    state: "Tamil Nadu",
    totalEmployees: "50-100",
    turnover: "$1M - $5M",
    yearEstablished: "2008",
    certifications: JSON.stringify(["ISO 13485", "CE Mark"]),
    inHouseTesting: true,
    importExport: false,
    responseTime: "24 hours",
    rating: "4.7",
    machineCapabilities: JSON.stringify(["Micro Machining", "Laser Cutting", "Anodizing"]),
    isActive: true,
  },
];

export async function seedManufacturers(): Promise<void> {
  log("Seeding manufacturers...");

  for (const manufacturer of manufacturerData) {
    const [existing] = await db
      .select()
      .from(manufacturers)
      .where(
        eq(manufacturers.city, manufacturer.city)
      );

    if (existing) {
      log(`  Manufacturer in ${manufacturer.city} already exists, skipping.`);
      continue;
    }

    await db.insert(manufacturers).values(manufacturer);
    log(`  Created manufacturer: ${manufacturer.industrySlug} - ${manufacturer.city}`);
  }

  log(`Manufacturers seeding complete. (${manufacturerData.length} records)`);
}
