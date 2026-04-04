import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { suppliers, InsertSupplier } from "../schema";
import { log } from "../../utils/logger";

const data: InsertSupplier[] = [
  // Automobile - Steel & Alloys
  { name: "Tata Steel Ltd", industrySlug: "automobile", materialCategory: "Steel & Alloys", location: "Mumbai, Maharashtra", materials: JSON.stringify(["High-Strength Steel", "Carbon Steel"]), rating: "4.8", reviews: 234, minOrder: "10 MT", price: "₹65,000/MT", certifications: JSON.stringify(["ISO 9001", "TS 16949"]), established: "1907", employees: "80,000+", contact: "+91-22-6665-8282", isActive: true },
  { name: "JSW Steel", industrySlug: "automobile", materialCategory: "Steel & Alloys", location: "Vijayanagar, Karnataka", materials: JSON.stringify(["Stainless Steel", "Tool Steel"]), rating: "4.7", reviews: 189, minOrder: "5 MT", price: "₹78,000/MT", certifications: JSON.stringify(["ISO 14001", "OHSAS 18001"]), established: "1982", employees: "40,000+", contact: "+91-8394-252525", isActive: true },
  // Automobile - Aluminum
  { name: "Hindalco Industries", industrySlug: "automobile", materialCategory: "Aluminum", location: "Renukoot, Uttar Pradesh", materials: JSON.stringify(["Aluminum Sheets", "Extrusions"]), rating: "4.6", reviews: 167, minOrder: "1 MT", price: "₹185/kg", certifications: JSON.stringify(["ISO 9001", "ISO 14001"]), established: "1958", employees: "20,000+", contact: "+91-5446-264264", isActive: true },
  { name: "National Aluminium Company (NALCO)", industrySlug: "automobile", materialCategory: "Aluminum", location: "Bhubaneswar, Odisha", materials: JSON.stringify(["Aluminum Ingots", "Billets", "Wire Rods"]), rating: "4.5", reviews: 134, minOrder: "500 kg", price: "₹175/kg", certifications: JSON.stringify(["ISO 9001", "ISO 14001"]), established: "1981", employees: "8,000+", contact: "+91-674-2301988", isActive: true },
  // Aerospace - Titanium Alloys
  { name: "MIDHANI", industrySlug: "aerospace", materialCategory: "Titanium Alloys", location: "Hyderabad, Telangana", materials: JSON.stringify(["Ti-6Al-4V", "Commercially Pure Ti"]), rating: "4.8", reviews: 89, minOrder: "100 kg", price: "₹3,500/kg", certifications: JSON.stringify(["AS9100", "NADCAP"]), established: "1973", employees: "2,000+", contact: "+91-40-2770-1194", isActive: true },
  // Aerospace - Carbon Fiber
  { name: "SGL Carbon India", industrySlug: "aerospace", materialCategory: "Carbon Fiber Composites", location: "Chennai, Tamil Nadu", materials: JSON.stringify(["Carbon Fiber Prepreg", "CFRP Components"]), rating: "4.7", reviews: 67, minOrder: "50 m²", price: "₹4,000/m²", certifications: JSON.stringify(["AS9100", "ISO 9001"]), established: "2005", employees: "500+", contact: "+91-44-2235-6789", isActive: true },
  // Construction - Structural Steel
  { name: "SAIL (Steel Authority of India)", industrySlug: "construction", materialCategory: "Structural Steel", location: "Bokaro, Jharkhand", materials: JSON.stringify(["I-Beams", "Angles", "Plates", "TMT Bars"]), rating: "4.6", reviews: 312, minOrder: "5 MT", price: "₹60,000/MT", certifications: JSON.stringify(["IS 2062", "BIS"]), established: "1973", employees: "80,000+", contact: "+91-11-2336-7481", isActive: true },
  // Construction - Cement
  { name: "UltraTech Cement", industrySlug: "construction", materialCategory: "Cement & Binders", location: "Mumbai, Maharashtra", materials: JSON.stringify(["OPC 53 Grade", "PPC Cement", "PSC Cement"]), rating: "4.8", reviews: 456, minOrder: "50 bags", price: "₹380/bag", certifications: JSON.stringify(["IS 12269", "BIS"]), established: "2004", employees: "20,000+", contact: "+91-22-6677-0000", isActive: true },
  // Electronics - PCB Materials
  { name: "Kinwong PCB India", industrySlug: "electronics", materialCategory: "PCB Materials", location: "Noida, Uttar Pradesh", materials: JSON.stringify(["FR4 Laminates", "Metal Core PCB", "Flexible PCB"]), rating: "4.6", reviews: 123, minOrder: "100 sheets", price: "₹420/sheet", certifications: JSON.stringify(["IPC-4101", "RoHS", "UL"]), established: "2010", employees: "3,000+", contact: "+91-120-4359000", isActive: true },
  // Healthcare - Medical Grade Plastics
  { name: "Invibio Polymer", industrySlug: "healthcare", materialCategory: "Medical Grade Plastics", location: "Pune, Maharashtra", materials: JSON.stringify(["PEEK", "Medical POM", "Medical PP"]), rating: "4.8", reviews: 78, minOrder: "10 kg", price: "₹2,800/kg", certifications: JSON.stringify(["ISO 13485", "FDA", "USP Class VI"]), established: "1999", employees: "200+", contact: "+91-20-4128-3456", isActive: true },
  // Electric - Copper
  { name: "Hindalco Birla Copper", industrySlug: "electric", materialCategory: "Copper & Alloys", location: "Dahej, Gujarat", materials: JSON.stringify(["Copper Rods", "Copper Sheets", "Copper Bus Bars"]), rating: "4.7", reviews: 201, minOrder: "500 kg", price: "₹720/kg", certifications: JSON.stringify(["ISO 9001", "BIS"]), established: "1998", employees: "5,000+", contact: "+91-2641-250000", isActive: true },
  // Medical - Stainless Steel
  { name: "Sandvik India", industrySlug: "medical", materialCategory: "Medical Grade Steel", location: "Pune, Maharashtra", materials: JSON.stringify(["316L SS", "Duplex Steel", "Surgical Steel"]), rating: "4.9", reviews: 56, minOrder: "25 kg", price: "₹450/kg", certifications: JSON.stringify(["ISO 13485", "ASTM F138", "ASTM F139"]), established: "1983", employees: "1,500+", contact: "+91-20-4120-1000", isActive: true },
];

export async function seedSuppliers(): Promise<void> {
  log("Seeding suppliers...");
  for (const item of data) {
    const [existing] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.name, item.name), eq(suppliers.industrySlug, item.industrySlug)));
    if (existing) { log(`  Already exists: ${item.name}`); continue; }
    await db.insert(suppliers).values(item);
    log(`  Created: ${item.name} (${item.industrySlug})`);
  }
  log(`Suppliers seeding complete. (${data.length} records)`);
}
