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
import { HttpException } from "../../core/HttpException";

export interface GstVerificationResult {
  gstNumber: string;
  legalName: string;
  tradeName: string;
  registrationStatus: string;
  dateOfRegistration: string;
  constitutionOfBusiness: string;
  principalPlaceOfBusiness: Record<string, unknown> | null;
  natureOfBusinessActivities: string[];
  stateJurisdiction: string | null;
  stateJurisdictionCode: string | null;
  dealerType: string | null;
  cancellationDate: string | null;
  additionalAddresses: unknown[] | null;
  lastUpdatedAtGstn: string | null;
  fromCache: boolean;
}

interface MastersIndiaGstResponse {
  data?: {
    lgnm?: string;
    tradeNam?: string;
    sts?: string;
    rgdt?: string;
    ctb?: string;
    pradr?: Record<string, unknown>;   // full address object, not just adr string
    stj?: string;                       // state jurisdiction
    stjCd?: string;                     // state jurisdiction code
    dty?: string;                       // dealer type
    cxdt?: string;                      // cancellation date
    adadr?: unknown[];                  // additional addresses
    lstupdt?: string;                   // last updated at GSTN
    nba?: string[];
  };
  error?: string | Record<string, unknown>;
  message?: string;
  status?: number;
}

function extractApiErrorMessage(raw: MastersIndiaGstResponse): string {
  if (typeof raw.error === "string") return raw.error;
  if (raw.error && typeof raw.error === "object") {
    const e = raw.error as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (typeof e.error === "string") return e.error;
    return JSON.stringify(e);
  }
  if (typeof raw.message === "string") return raw.message;
  return "GST number not found or invalid";
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function fetchFromMastersIndia(gstNumber: string): Promise<GstVerificationResult> {
  if (!env.MASTERS_INDIA_API_KEY) {
    throw new HttpException(503, "GST verification service is not configured");
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
    throw new HttpException(400, extractApiErrorMessage(raw));
  }

  const d = raw.data;

  return {
    gstNumber,
    legalName: d.lgnm ?? "",
    tradeName: d.tradeNam ?? "",
    registrationStatus: d.sts ?? "Unknown",
    dateOfRegistration: d.rgdt ?? "",
    constitutionOfBusiness: d.ctb ?? "",
    principalPlaceOfBusiness: d.pradr ?? null,
    natureOfBusinessActivities: Array.isArray(d.nba) ? d.nba : [],
    stateJurisdiction: d.stj ?? null,
    stateJurisdictionCode: d.stjCd ?? null,
    dealerType: d.dty ?? null,
    cancellationDate: d.cxdt ?? null,
    additionalAddresses: Array.isArray(d.adadr) ? d.adadr : null,
    lastUpdatedAtGstn: d.lstupdt ?? null,
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
      principalPlaceOfBusiness: safeJsonParse<Record<string, unknown> | null>(
        cached.principalPlaceOfBusiness,
        null
      ),
      natureOfBusinessActivities: safeJsonParse<string[]>(
        cached.natureOfBusinessActivities,
        []
      ),
      stateJurisdiction: cached.stateJurisdiction ?? null,
      stateJurisdictionCode: cached.stateJurisdictionCode ?? null,
      dealerType: cached.dealerType ?? null,
      cancellationDate: cached.cancellationDate ?? null,
      additionalAddresses: cached.additionalAddresses as unknown[] | null,
      lastUpdatedAtGstn: cached.lastUpdatedAtGstn ?? null,
      fromCache: true,
    };
  }

  // 2. Fetch from Masters India API
  const result = await fetchFromMastersIndia(upper);

  // 3. Save to DB cache — text columns get JSON-serialized, new typed columns stored directly
  await db.insert(gstInfo).values({
    gstNumber: upper,
    legalName: result.legalName,
    tradeName: result.tradeName,
    registrationStatus: result.registrationStatus,
    dateOfRegistration: result.dateOfRegistration,
    constitutionOfBusiness: result.constitutionOfBusiness,
    principalPlaceOfBusiness: result.principalPlaceOfBusiness
      ? JSON.stringify(result.principalPlaceOfBusiness)
      : null,
    natureOfBusinessActivities: JSON.stringify(result.natureOfBusinessActivities),
    stateJurisdiction: result.stateJurisdiction,
    stateJurisdictionCode: result.stateJurisdictionCode,
    dealerType: result.dealerType,
    cancellationDate: result.cancellationDate,
    additionalAddresses: result.additionalAddresses,
    lastUpdatedAtGstn: result.lastUpdatedAtGstn,
    lastVerifiedAt: new Date(),
    rawApiResponse: JSON.stringify(result),
  });

  return result;
}
