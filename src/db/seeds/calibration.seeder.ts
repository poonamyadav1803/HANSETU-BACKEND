import { eq } from "drizzle-orm";
import { db } from "../index";
import { calibrationServices, InsertCalibrationService } from "../schema";
import { log } from "../../utils/logger";

const data: InsertCalibrationService[] = [
  {
    name: "Precision Calibration Services",
    industrySlug: "automobile",
    city: "Mumbai",
    price: "₹15,000 - ₹40,000",
    accreditation: "NABL",
    doorDelivery: true,
    visitServices: true,
    responseTime: "24 hours",
    rating: "4.8",
    instruments: JSON.stringify(["Pressure Gauges", "Temperature Sensors", "Flow Meters"]),
    isActive: true,
  },
  {
    name: "Aerospace Calibration Lab",
    industrySlug: "aerospace",
    city: "Bangalore",
    price: "₹40,000 - ₹80,000",
    accreditation: "A2LA",
    doorDelivery: true,
    visitServices: false,
    responseTime: "12 hours",
    rating: "4.9",
    instruments: JSON.stringify(["Torque Tools", "Pressure Systems", "Electrical Instruments"]),
    isActive: true,
  },
  {
    name: "Electronics Test & Calibration",
    industrySlug: "electronics",
    city: "Chennai",
    price: "₹8,000 - ₹25,000",
    accreditation: "NABL",
    doorDelivery: true,
    visitServices: true,
    responseTime: "18 hours",
    rating: "4.7",
    instruments: JSON.stringify(["Oscilloscopes", "Multimeters", "Signal Generators", "LCR Meters"]),
    isActive: true,
  },
  {
    name: "Healthcare Instrument Calibration",
    industrySlug: "healthcare",
    city: "Delhi",
    price: "₹10,000 - ₹35,000",
    accreditation: "NABL",
    doorDelivery: true,
    visitServices: true,
    responseTime: "6 hours",
    rating: "4.8",
    instruments: JSON.stringify(["Blood Pressure Monitors", "Thermometers", "Weighing Scales", "Infusion Pumps"]),
    isActive: true,
  },
  {
    name: "Defense Systems Calibration",
    industrySlug: "military",
    city: "Hyderabad",
    price: "₹50,000 - ₹2,00,000",
    accreditation: "NABL",
    doorDelivery: false,
    visitServices: true,
    responseTime: "48 hours",
    rating: "5.0",
    instruments: JSON.stringify(["Radar Systems", "Navigation Equipment", "Weapons Sighting Systems"]),
    isActive: true,
  },
  {
    name: "Space Research Calibration Center",
    industrySlug: "space",
    city: "Bangalore",
    price: "₹1,00,000+",
    accreditation: "NABL",
    doorDelivery: false,
    visitServices: true,
    responseTime: "72 hours",
    rating: "4.9",
    instruments: JSON.stringify(["Inertial Measurement Units", "Star Trackers", "Thrust Measurement Systems"]),
    isActive: true,
  },
  {
    name: "Construction Equipment Calibration",
    industrySlug: "construction",
    city: "Pune",
    price: "₹12,000 - ₹45,000",
    accreditation: "NABL",
    doorDelivery: true,
    visitServices: true,
    responseTime: "24 hours",
    rating: "4.6",
    instruments: JSON.stringify(["Concrete Testers", "Load Cells", "Survey Instruments", "Torque Wrenches"]),
    isActive: true,
  },
];

export async function seedCalibrationServices(): Promise<void> {
  log("Seeding calibration services...");
  for (const item of data) {
    const [existing] = await db
      .select()
      .from(calibrationServices)
      .where(eq(calibrationServices.name, item.name));
    if (existing) { log(`  Already exists: ${item.name}`); continue; }
    await db.insert(calibrationServices).values(item);
    log(`  Created: ${item.name}`);
  }
  log(`Calibration services seeding complete. (${data.length} records)`);
}
