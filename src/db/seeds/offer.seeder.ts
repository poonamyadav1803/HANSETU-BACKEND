/**
 * Offer Seeder
 *
 * Seeds the offers table with promotional deal listings.
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import { offers, InsertOffer } from "../schema";
import { log } from "../../utils/logger";

const offerData: InsertOffer[] = [
  {
    title: "Steel Materials Bulk Discount",
    description: "Get 25% off on all steel materials for orders above 1000kg",
    discount: "25%",
    category: "Raw Materials",
    timeRemaining: "2 days 14 hours",
    isFeatured: true,
    isActive: true,
  },
  {
    title: "CNC Machining Services",
    description: "Special pricing on precision CNC machining for aerospace components",
    discount: "30%",
    category: "Manufacturing",
    timeRemaining: "5 days 8 hours",
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Calibration Bundle Deal",
    description: "Calibrate 5+ instruments and save big on our premium calibration services",
    discount: "40%",
    category: "Services",
    timeRemaining: "1 day 6 hours",
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Power Tools Clearance",
    description: "End of season clearance sale on professional power tools",
    discount: "50%",
    category: "Tools",
    timeRemaining: "3 days 12 hours",
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Training Program Early Bird",
    description: "Register early for our advanced manufacturing training programs",
    discount: "20%",
    category: "Training",
    timeRemaining: "7 days 4 hours",
    isFeatured: false,
    isActive: true,
  },
  {
    title: "R&D Consultation Package",
    description: "Complete R&D consultation package for new product development",
    discount: "35%",
    category: "R&D",
    timeRemaining: "4 days 16 hours",
    isFeatured: false,
    isActive: true,
  },
];

export async function seedOffers(): Promise<void> {
  log("Seeding offers...");

  for (const offer of offerData) {
    const [existing] = await db
      .select()
      .from(offers)
      .where(eq(offers.title, offer.title));

    if (existing) {
      log(`  Offer already exists: ${offer.title}`);
      continue;
    }

    await db.insert(offers).values(offer);
    log(`  Created offer: ${offer.title}`);
  }

  log(`Offers seeding complete. (${offerData.length} records)`);
}
