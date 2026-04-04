/**
 * Machine Seeder
 *
 * Seeds the machines table with sample industrial machine listings.
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import { machines, InsertMachine } from "../schema";
import { log } from "../../utils/logger";

const machineData: InsertMachine[] = [
  {
    name: "CNC Milling Machine",
    category: "Operation Machines",
    type: "Milling",
    location: "Mumbai",
    price: "$45,000",
    specs: JSON.stringify({
      workArea: "1000x600x500mm",
      spindle: "24,000 RPM",
      accuracy: "±0.005mm",
      power: "15kW",
    }),
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Band Saw Cutting Machine",
    category: "Cutting Machines",
    type: "Band Saw",
    location: "Chennai",
    price: "$12,000",
    specs: JSON.stringify({
      cuttingCapacity: "400mm diameter",
      bladeSpeed: "20-100 m/min",
      motorPower: "4kW",
      weight: "1200kg",
    }),
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Surface Grinding Machine",
    category: "Surface Finishing",
    type: "Grinding",
    location: "Bangalore",
    price: "$25,000",
    specs: JSON.stringify({
      tableSize: "500x200mm",
      wheelSpeed: "1800 RPM",
      precision: "±0.001mm",
      coolantSystem: "Flood Cooling",
    }),
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Profile Bending Machine",
    category: "Forming/Bending",
    type: "Profile Bending",
    location: "Pune",
    price: "$35,000",
    specs: JSON.stringify({
      maxSize: "250x350mm",
      bendingForce: "200 tons",
      strokeLength: "300mm",
      bendingAngle: "0-135°",
    }),
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Plasma Cutting Machine",
    category: "Cutting Machines",
    type: "Plasma Cutting",
    location: "Ahmedabad",
    price: "$18,000",
    specs: JSON.stringify({
      cuttingThickness: "0.5-50mm",
      cuttingSpeed: "up to 8000 mm/min",
      accuracy: "±0.3mm",
      power: "65A",
    }),
    isFeatured: false,
    isActive: true,
  },
  {
    name: "CNC Lathe Machine",
    category: "Operation Machines",
    type: "CNC Lathe",
    location: "Hyderabad",
    price: "$28,000",
    specs: JSON.stringify({
      swingOverBed: "500mm",
      maxLength: "1500mm",
      spindleSpeed: "100-4500 RPM",
      power: "11kW",
    }),
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Press Brake Machine",
    category: "Forming/Bending",
    type: "Press Brake",
    location: "Delhi",
    price: "$42,000",
    specs: JSON.stringify({
      bendingForce: "100 tons",
      workingLength: "3000mm",
      openHeight: "400mm",
      strokeLength: "200mm",
    }),
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Bench Polishing Machine",
    category: "Surface Finishing",
    type: "Bench Polishing",
    location: "Coimbatore",
    price: "$3,500",
    specs: JSON.stringify({
      wheelDiameter: "200mm",
      motorSpeed: "2800 RPM",
      power: "0.75kW",
      weight: "45kg",
    }),
    isFeatured: false,
    isActive: true,
  },
];

export async function seedMachines(): Promise<void> {
  log("Seeding machines...");

  for (const machine of machineData) {
    const [existing] = await db
      .select()
      .from(machines)
      .where(eq(machines.name, machine.name));

    if (existing) {
      log(`  Machine already exists: ${machine.name}`);
      continue;
    }

    await db.insert(machines).values(machine);
    log(`  Created machine: ${machine.name}`);
  }

  log(`Machines seeding complete. (${machineData.length} records)`);
}
