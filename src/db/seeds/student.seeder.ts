import { eq } from "drizzle-orm";
import { db } from "../index";
import { studentServices, InsertStudentService } from "../schema";
import { log } from "../../utils/logger";

const data: InsertStudentService[] = [
  { name: "Industrial Engineering Internship", category: "Internships", industrySlug: "automobile", provider: "Manufacturing Excellence Corp", type: "3-month Internship", duration: "3 months", stipend: "₹15,000/month", city: "Mumbai", rating: "4.8", skills: JSON.stringify(["Process Optimization", "Quality Control", "Data Analysis"]), description: "Hands-on internship in industrial engineering and manufacturing processes", isActive: true },
  { name: "Fresh Graduate Placement Program", category: "Job Placements", industrySlug: "electronics", provider: "TechCorp Industries", type: "Full-time Position", duration: "Permanent", stipend: "₹4,50,000/year", city: "Bangalore", rating: "4.7", skills: JSON.stringify(["Manufacturing", "Technical Skills", "Problem Solving"]), description: "Graduate placement program for engineering freshers in manufacturing sector", isActive: true },
  { name: "CAD/CAM Skills Bootcamp", category: "Skill Development", industrySlug: "automobile", provider: "Design Academy", type: "Certificate Course", duration: "6 weeks", stipend: "₹35,000 course fee", city: "Chennai", rating: "4.9", skills: JSON.stringify(["AutoCAD", "SolidWorks", "CNC Programming"]), description: "Intensive skill development for CAD/CAM software and CNC programming", isActive: true },
  { name: "Aerospace Internship Program", category: "Internships", industrySlug: "aerospace", provider: "HAL DRDO Consortium", type: "6-month Internship", duration: "6 months", stipend: "₹20,000/month", city: "Bangalore", rating: "5.0", skills: JSON.stringify(["Aerospace Systems", "CATIA", "Structural Analysis", "Testing"]), description: "Prestigious internship program at leading aerospace organizations", isActive: true },
  { name: "Electronics Graduate Scholarship", category: "Scholarships", industrySlug: "electronics", provider: "NASSCOM Foundation", type: "Scholarship", duration: "1 year", stipend: "₹1,50,000/year", city: "Hyderabad", rating: "4.8", skills: JSON.stringify(["VLSI Design", "Embedded Systems", "Signal Processing"]), description: "Scholarship for electronics engineering graduates pursuing advanced specialization", isActive: true },
  { name: "Manufacturing Career Guidance", category: "Career Guidance", industrySlug: "automobile", provider: "CII Manufacturing Skills", type: "Consulting", duration: "3 sessions", stipend: "Free", city: "All Cities", rating: "4.6", skills: JSON.stringify(["Career Planning", "Industry Insights", "Resume Building", "Interview Prep"]), description: "Personalized career guidance for engineering students entering manufacturing", isActive: true },
  { name: "Medical Device Internship", category: "Internships", industrySlug: "medical", provider: "Siemens Healthineers India", type: "4-month Internship", duration: "4 months", stipend: "₹18,000/month", city: "Gurgaon", rating: "4.9", skills: JSON.stringify(["Medical Devices", "Regulatory Affairs", "Quality Systems", "R&D"]), description: "Internship in medical device design, testing and regulatory compliance", isActive: true },
  { name: "Data Science for Manufacturing", category: "Skill Development", industrySlug: "electronics", provider: "IIT Madras Online", type: "Certificate Course", duration: "12 weeks", stipend: "₹45,000 course fee", city: "Online", rating: "4.8", skills: JSON.stringify(["Python", "Machine Learning", "Quality Analytics", "Predictive Maintenance"]), description: "Data science and ML applications for manufacturing and quality control", isActive: true },
];

export async function seedStudentServices(): Promise<void> {
  log("Seeding student services...");
  for (const item of data) {
    const [existing] = await db
      .select()
      .from(studentServices)
      .where(eq(studentServices.name, item.name));
    if (existing) { log(`  Already exists: ${item.name}`); continue; }
    await db.insert(studentServices).values(item);
    log(`  Created: ${item.name}`);
  }
  log(`Student services seeding complete. (${data.length} records)`);
}
