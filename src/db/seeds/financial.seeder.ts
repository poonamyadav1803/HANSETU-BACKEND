import { eq } from "drizzle-orm";
import { db } from "../index";
import { financialServices, InsertFinancialService } from "../schema";
import { log } from "../../utils/logger";

const data: InsertFinancialService[] = [
  { name: "Industrial Equipment Loans", category: "Equipment Financing", industrySlug: "automobile", provider: "Industrial Finance Corp", type: "Loan", interestRate: "8.5% - 12%", amount: "₹10 Lakh - ₹10 Crore", city: "Mumbai", rating: "4.8", features: JSON.stringify(["Quick Approval", "Flexible Terms", "Collateral Options"]), description: "Specialized financing solutions for industrial equipment and machinery", isActive: true },
  { name: "Manufacturing Business Loans", category: "Business Loans", industrySlug: "automobile", provider: "Enterprise Capital Solutions", type: "Business Loan", interestRate: "9% - 15%", amount: "₹50 Lakh - ₹50 Crore", city: "Delhi", rating: "4.7", features: JSON.stringify(["No Collateral", "Fast Processing", "Competitive Rates"]), description: "Unsecured business loans for manufacturing and industrial enterprises", isActive: true },
  { name: "Export-Import Financing", category: "Trade Finance", industrySlug: "aerospace", provider: "Global Trade Bank", type: "Trade Finance", interestRate: "7% - 10%", amount: "₹25 Lakh - ₹20 Crore", city: "Chennai", rating: "4.9", features: JSON.stringify(["Letter of Credit", "Trade Insurance", "Currency Hedging"]), description: "Comprehensive trade finance solutions for import-export businesses", isActive: true },
  { name: "MSME Working Capital Credit", category: "Working Capital", industrySlug: "electronics", provider: "SIDBI Finance", type: "Credit Line", interestRate: "7.5% - 11%", amount: "₹5 Lakh - ₹5 Crore", city: "All Cities", rating: "4.6", features: JSON.stringify(["Government Backed", "CGTMSE Cover", "Easy Documentation"]), description: "Working capital credit for small and medium manufacturing enterprises", isActive: true },
  { name: "Plant & Machinery Insurance", category: "Insurance Services", industrySlug: "automobile", provider: "New India Assurance", type: "Insurance", interestRate: "N/A", amount: "As per asset value", city: "All Cities", rating: "4.7", features: JSON.stringify(["Fire & Allied Perils", "Machinery Breakdown", "Business Interruption"]), description: "Comprehensive insurance coverage for industrial plant and machinery", isActive: true },
  { name: "Startup Manufacturing Fund", category: "Investment Advisory", industrySlug: "electronics", provider: "Nexus Venture Partners", type: "Venture Capital", interestRate: "Equity based", amount: "₹1 Crore - ₹50 Crore", city: "Bangalore", rating: "4.8", features: JSON.stringify(["Equity Funding", "Mentorship", "Network Access", "Market Expansion"]), description: "Investment and mentorship for manufacturing startups and deep-tech companies", isActive: true },
  { name: "Pharma Industry Financing", category: "Business Loans", industrySlug: "healthcare", provider: "HDFC Bank Industrial", type: "Sector Loan", interestRate: "8% - 11%", amount: "₹1 Crore - ₹100 Crore", city: "Ahmedabad", rating: "4.9", features: JSON.stringify(["WHO-GMP Plant Finance", "R&D Capex", "Working Capital"]), description: "Specialized financing for pharmaceutical manufacturing and R&D investments", isActive: true },
  { name: "Aerospace Defense Project Finance", category: "Trade Finance", industrySlug: "aerospace", provider: "EXIM Bank India", type: "Project Finance", interestRate: "6.5% - 9%", amount: "₹10 Crore - ₹1,000 Crore", city: "Delhi", rating: "5.0", features: JSON.stringify(["Defense Offset", "Government Guarantee", "Long Tenor"]), description: "Long-term project financing for defense and aerospace manufacturing programs", isActive: true },
];

export async function seedFinancialServices(): Promise<void> {
  log("Seeding financial services...");
  for (const item of data) {
    const [existing] = await db
      .select()
      .from(financialServices)
      .where(eq(financialServices.name, item.name));
    if (existing) { log(`  Already exists: ${item.name}`); continue; }
    await db.insert(financialServices).values(item);
    log(`  Created: ${item.name}`);
  }
  log(`Financial services seeding complete. (${data.length} records)`);
}
