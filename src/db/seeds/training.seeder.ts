import { eq } from "drizzle-orm";
import { db } from "../index";
import { trainingPrograms, InsertTrainingProgram } from "../schema";
import { log } from "../../utils/logger";

const data: InsertTrainingProgram[] = [
  { name: "Advanced CNC Programming", category: "Manufacturing", industrySlug: "automobile", provider: "Industrial Training Institute", price: "₹90,000", duration: "4 weeks", mode: "In-person", city: "Mumbai", rating: "4.9", capacity: "15 participants", certification: "Certified CNC Programmer", skills: JSON.stringify(["G-Code Programming", "Tool Path Optimization", "Machine Setup"]), description: "Comprehensive CNC programming training for advanced manufacturing operations", isActive: true },
  { name: "Automotive Quality Standards", category: "Automobile", industrySlug: "automobile", provider: "Auto Excellence Academy", price: "₹60,000", duration: "2 weeks", mode: "Hybrid", city: "Chennai", rating: "4.8", capacity: "20 participants", certification: "ISO/TS 16949 Certified", skills: JSON.stringify(["Quality Management", "Statistical Process Control", "Audit Techniques"]), description: "Training on automotive industry quality standards and best practices", isActive: true },
  { name: "Aerospace Manufacturing Processes", category: "Aerospace", industrySlug: "aerospace", provider: "Aerospace Training Center", price: "₹1,10,000", duration: "6 weeks", mode: "In-person", city: "Bangalore", rating: "4.9", capacity: "12 participants", certification: "AS9100 Specialist", skills: JSON.stringify(["Aerospace Standards", "Manufacturing Processes", "Quality Control"]), description: "Specialized training for aerospace manufacturing and quality requirements", isActive: true },
  { name: "Automotive Design Engineering", category: "Automobile", industrySlug: "automobile", provider: "Maruti Suzuki Institute", price: "₹1,35,000", duration: "8 weeks", mode: "In-person", city: "Gurgaon", rating: "4.9", capacity: "20 participants", certification: "Automotive Design Expert", skills: JSON.stringify(["CAD Design", "Vehicle Dynamics", "Crash Analysis", "Powertrain Systems"]), description: "Comprehensive automotive design and engineering training program", isActive: true },
  { name: "Electric Vehicle Technology", category: "Automobile", industrySlug: "electric", provider: "Tata Motors Academy", price: "₹1,65,000", duration: "6 weeks", mode: "Hybrid", city: "Pune", rating: "4.8", capacity: "18 participants", certification: "EV Technology Specialist", skills: JSON.stringify(["Battery Technology", "Electric Motors", "Charging Systems", "Vehicle Control"]), description: "Advanced training in electric vehicle technology and manufacturing", isActive: true },
  { name: "Automotive Safety Systems", category: "Automobile", industrySlug: "automobile", provider: "Bosch Training Center", price: "₹1,05,000", duration: "5 weeks", mode: "In-person", city: "Bangalore", rating: "4.7", capacity: "25 participants", certification: "Safety Systems Engineer", skills: JSON.stringify(["ADAS", "Airbag Systems", "ABS Technology", "ESP Systems"]), description: "Training on advanced automotive safety systems and technologies", isActive: true },
  { name: "Automotive Production Management", category: "Automobile", industrySlug: "automobile", provider: "Bajaj Auto Institute", price: "₹1,20,000", duration: "4 weeks", mode: "Hybrid", city: "Aurangabad", rating: "4.6", capacity: "22 participants", certification: "Production Manager", skills: JSON.stringify(["Lean Manufacturing", "Supply Chain", "Quality Control", "Process Optimization"]), description: "Management training for automotive production and operations", isActive: true },
  { name: "Electronics Circuit Design", category: "Electronics", industrySlug: "electronics", provider: "CDAC Training", price: "₹75,000", duration: "3 weeks", mode: "Hybrid", city: "Pune", rating: "4.8", capacity: "15 participants", certification: "Circuit Design Professional", skills: JSON.stringify(["PCB Design", "Schematic Capture", "SPICE Simulation", "EMI/EMC"]), description: "Advanced circuit design training for electronics engineers", isActive: true },
  { name: "Industrial Safety & Compliance", category: "Safety", industrySlug: "construction", provider: "NSCI Safety Institute", price: "₹45,000", duration: "2 weeks", mode: "In-person", city: "Mumbai", rating: "4.7", capacity: "30 participants", certification: "Certified Safety Officer", skills: JSON.stringify(["OSHA Standards", "Risk Assessment", "Emergency Response", "Safety Audits"]), description: "Comprehensive industrial safety training for manufacturing professionals", isActive: true },
  { name: "ISO 9001 Quality Management", category: "Quality Management", industrySlug: "automobile", provider: "Bureau Veritas India", price: "₹35,000", duration: "1 week", mode: "Online", city: "All Cities", rating: "4.9", capacity: "Unlimited", certification: "ISO 9001 Lead Auditor", skills: JSON.stringify(["QMS Implementation", "Internal Auditing", "Process Approach", "CAPA"]), description: "ISO 9001:2015 Quality Management System implementation and auditing training", isActive: true },
];

export async function seedTrainingPrograms(): Promise<void> {
  log("Seeding training programs...");
  for (const item of data) {
    const [existing] = await db
      .select()
      .from(trainingPrograms)
      .where(eq(trainingPrograms.name, item.name));
    if (existing) { log(`  Already exists: ${item.name}`); continue; }
    await db.insert(trainingPrograms).values(item);
    log(`  Created: ${item.name}`);
  }
  log(`Training programs seeding complete. (${data.length} records)`);
}
