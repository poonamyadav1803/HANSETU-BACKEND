/**
 * GST Verification Service
 * - Checks DB cache first
 * - Falls back to Masters India sandbox API
 * - Saves result to gst_info table
 */

import { db } from "../../db";
import { gstInfo } from "../../db/schema";
import { eq } from "drizzle-orm";
import { env } from "../../config/env";

export interface GstVerificationResult {
  gstNumber: string;
  legalName: string;
  tradeName: string;
  registrationStatus: string;
  dateOfRegistration: string;
  constitutionOfBusiness: string;
  principalPlaceOfBusiness: string;
  natureOfBusinessActivities: string;
  fromCache: boolean;
}

/**
 * Masters India sandbox API response shape (simplified).
 * Full schema: https://docs.mastersindia.co/reference/gst-search
 */
interface MastersIndiaGstResponse {
  data?: {
    lgnm?: string;     // legal name
    tradeNam?: string; // trade name
    sts?: string;      // status
    rgdt?: string;     // registration date
    ctb?: string;      // constitution of business
    pradr?: {
      adr?: string;    // address
    };
    nba?: string[];    // nature of business activities
  };
  error?: string;
}

async function fetchFromMastersIndia(gstNumber: string): Promise<GstVerificationResult> {
  if (!env.MASTERS_INDIA_API_KEY) {
    throw new Error("MASTERS_INDIA_API_KEY not configured");
  }

  const url = `https://api.mastersindia.co/mastersindia/v2/gstin?gstin=${gstNumber}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${env.MASTERS_INDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const raw = await response.json() as MastersIndiaGstResponse;

  if (!response.ok || raw.error || !raw.data) {
    throw new Error(raw.error || "GST number not found or invalid");
  }

  const d = raw.data;
  return {
    gstNumber,
    legalName: d.lgnm ?? "",
    tradeName: d.tradeNam ?? "",
    registrationStatus: d.sts ?? "Unknown",
    dateOfRegistration: d.rgdt ?? "",
    constitutionOfBusiness: d.ctb ?? "",
    principalPlaceOfBusiness: d.pradr?.adr ?? "",
    natureOfBusinessActivities: Array.isArray(d.nba) ? d.nba.join(", ") : "",
    fromCache: false,
  };
}

export async function verifyGst(gstNumber: string): Promise<GstVerificationResult> {
  const upper = gstNumber.toUpperCase().trim();

  // 1. Check DB cache
  const [cached] = await db
    .select()
    .from(gstInfo)
    .where(eq(gstInfo.gstNumber, upper))
    .limit(1);

  if (cached) {
    return {
      gstNumber: cached.gstNumber,
      legalName: cached.legalName ?? "",
      tradeName: cached.tradeName ?? "",
      registrationStatus: cached.registrationStatus ?? "Unknown",
      dateOfRegistration: cached.dateOfRegistration ?? "",
      constitutionOfBusiness: cached.constitutionOfBusiness ?? "",
      principalPlaceOfBusiness: cached.principalPlaceOfBusiness ?? "",
      natureOfBusinessActivities: cached.natureOfBusinessActivities ?? "",
      fromCache: true,
    };
  }

  // 2. Fetch from Masters India API
  const result = await fetchFromMastersIndia(upper);

  // 3. Save to DB cache
  await db.insert(gstInfo).values({
    gstNumber: upper,
    legalName: result.legalName,
    tradeName: result.tradeName,
    registrationStatus: result.registrationStatus,
    dateOfRegistration: result.dateOfRegistration,
    constitutionOfBusiness: result.constitutionOfBusiness,
    principalPlaceOfBusiness: result.principalPlaceOfBusiness,
    natureOfBusinessActivities: result.natureOfBusinessActivities,
    rawApiResponse: JSON.stringify(result),
  });

  return result;
}
