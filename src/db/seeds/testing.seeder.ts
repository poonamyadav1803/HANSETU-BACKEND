import { eq } from "drizzle-orm";
import { db } from "../index";
import { testingServices, InsertTestingService } from "../schema";
import { log } from "../../utils/logger";

const data: InsertTestingService[] = [
  {
    name: "Material Strength Testing",
    category: "automobile",
    provider: "Advanced Testing Labs",
    industrySlug: "automobile",
    price: "₹15,000 - ₹60,000",
    turnaround: "3-5 days",
    city: "Mumbai",
    rating: "4.9",
    certifications: JSON.stringify(["ISO 17025", "NABL", "A2LA"]),
    testTypes: JSON.stringify(["Tensile Testing", "Fatigue Testing", "Impact Testing"]),
    description: "Comprehensive material testing services for automotive components",
    isActive: true,
  },
  {
    name: "Environmental Testing",
    category: "aerospace",
    provider: "Aerospace Test Solutions",
    industrySlug: "aerospace",
    price: "₹40,000 - ₹1,20,000",
    turnaround: "5-7 days",
    city: "Bangalore",
    rating: "4.8",
    certifications: JSON.stringify(["AS9100", "ISO 9001", "RTCA"]),
    testTypes: JSON.stringify(["Temperature Cycling", "Vibration Testing", "Humidity Testing"]),
    description: "Environmental testing for aerospace components and systems",
    isActive: true,
  },
  {
    name: "Electronic Component Testing",
    category: "electronics",
    provider: "ElectroTest Labs",
    industrySlug: "electronics",
    price: "₹12,000 - ₹50,000",
    turnaround: "2-4 days",
    city: "Chennai",
    rating: "4.7",
    certifications: JSON.stringify(["IEC 17025", "FCC", "CE"]),
    testTypes: JSON.stringify(["EMC Testing", "Safety Testing", "Performance Testing"]),
    description: "Complete electronic component testing and certification services",
    isActive: true,
  },
  {
    name: "Construction Material Testing",
    category: "construction",
    provider: "BuildTest Laboratories",
    industrySlug: "construction",
    price: "₹8,000 - ₹35,000",
    turnaround: "2-3 days",
    city: "Delhi",
    rating: "4.6",
    certifications: JSON.stringify(["BIS", "ISO 17025", "NABL"]),
    testTypes: JSON.stringify(["Compressive Strength", "Flexural Strength", "Water Absorption"]),
    description: "Structural material testing for construction projects",
    isActive: true,
  },
  {
    name: "Medical Device Testing",
    category: "medical",
    provider: "MedTest Certification",
    industrySlug: "medical",
    price: "₹50,000 - ₹2,00,000",
    turnaround: "10-15 days",
    city: "Hyderabad",
    rating: "4.9",
    certifications: JSON.stringify(["ISO 13485", "FDA", "CE Medical"]),
    testTypes: JSON.stringify(["Biocompatibility Testing", "Sterility Testing", "Performance Validation"]),
    description: "Regulatory testing and certification for medical devices",
    isActive: true,
  },
  {
    name: "Chemical Analysis & Testing",
    category: "chemical",
    provider: "ChemAnalyt Labs",
    industrySlug: "construction",
    price: "₹5,000 - ₹30,000",
    turnaround: "1-3 days",
    city: "Ahmedabad",
    rating: "4.7",
    certifications: JSON.stringify(["ISO 17025", "NABL", "GLP"]),
    testTypes: JSON.stringify(["HPLC Analysis", "GC-MS Analysis", "Elemental Analysis"]),
    description: "Advanced chemical analysis and quality control testing",
    isActive: true,
  },
];

export async function seedTestingServices(): Promise<void> {
  log("Seeding testing services...");
  for (const item of data) {
    const [existing] = await db
      .select()
      .from(testingServices)
      .where(eq(testingServices.name, item.name));
    if (existing) { log(`  Already exists: ${item.name}`); continue; }
    await db.insert(testingServices).values(item);
    log(`  Created: ${item.name}`);
  }
  log(`Testing services seeding complete. (${data.length} records)`);
}
