/**
 * GST Verification Service
 * - Checks DB cache first
 * - Falls back to WhiteBooks public GST API
 * - Saves result to gst_info table
 */

import { eq } from "drizzle-orm";
import { env } from "../../config/env";
import { HttpException } from "../../core/HttpException";
import { db } from "../../db";
import { gstInfo } from "../../db/schema";

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
  centralJurisdiction: string | null;
  centralJurisdictionCode: string | null;
  dealerType: string | null;
  einvoiceStatus: string | null;
  cancellationDate: string | null;
  additionalAddresses: unknown[] | null;
  lastUpdatedAtGstn: string | null;
  fromCache: boolean;
}

interface WhiteBooksGstPayload {
  stjCd?: string;
  lgnm?: string;
  stj?: string;
  dty?: string;
  adadr?: unknown[];
  cxdt?: string;
  gstin?: string;
  nba?: string[];
  lstupdt?: string;
  rgdt?: string;
  ctb?: string;
  pradr?: Record<string, unknown>;
  sts?: string;
  tradeNam?: string;
  ctjCd?: string;
  ctj?: string;
  einvoiceStatus?: string;
}

interface WhiteBooksGstResponse {
  data?: WhiteBooksGstPayload;
  status_cd?: string;
  status_desc?: string;
  error?: string | Record<string, unknown>;
}

function extractApiErrorMessage(raw: WhiteBooksGstResponse): string {
  if (typeof raw.error === "string") return raw.error;
  if (raw.error && typeof raw.error === "object") {
    const errorObject = raw.error as Record<string, unknown>;
    if (typeof errorObject.message === "string") return errorObject.message;
    if (typeof errorObject.error === "string") return errorObject.error;
    return JSON.stringify(errorObject);
  }
  if (typeof raw.status_desc === "string") return raw.status_desc;
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

async function fetchFromWhiteBooks(
  gstNumber: string
): Promise<{ result: GstVerificationResult; rawResponse: WhiteBooksGstResponse }> {
  if (
    !env.WHITEBOOKS_GST_API_URL ||
    !env.WHITEBOOKS_GST_EMAIL ||
    !env.WHITEBOOKS_CLIENT_ID ||
    !env.WHITEBOOKS_CLIENT_SECRET
  ) {
    throw new HttpException(503, "GST verification service is not configured");
  }

  const url = new URL(env.WHITEBOOKS_GST_API_URL);
  url.searchParams.set("email", env.WHITEBOOKS_GST_EMAIL);
  url.searchParams.set("gstin", gstNumber);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "*/*",
      client_id: env.WHITEBOOKS_CLIENT_ID,
      client_secret: env.WHITEBOOKS_CLIENT_SECRET,
    },
  });

  const raw = (await response.json()) as WhiteBooksGstResponse;

  if (!response.ok || raw.status_cd !== "1" || !raw.data) {
    throw new HttpException(400, extractApiErrorMessage(raw));
  }

  const payload = raw.data;

  return {
    result: {
      gstNumber: payload.gstin ?? gstNumber,
      legalName: payload.lgnm ?? "",
      tradeName: payload.tradeNam ?? "",
      registrationStatus: payload.sts ?? "Unknown",
      dateOfRegistration: payload.rgdt ?? "",
      constitutionOfBusiness: payload.ctb ?? "",
      principalPlaceOfBusiness: payload.pradr ?? null,
      natureOfBusinessActivities: Array.isArray(payload.nba) ? payload.nba : [],
      stateJurisdiction: payload.stj ?? null,
      stateJurisdictionCode: payload.stjCd ?? null,
      centralJurisdiction: payload.ctj ?? null,
      centralJurisdictionCode: payload.ctjCd ?? null,
      dealerType: payload.dty ?? null,
      einvoiceStatus: payload.einvoiceStatus ?? null,
      cancellationDate: payload.cxdt || null,
      additionalAddresses: Array.isArray(payload.adadr) ? payload.adadr : null,
      lastUpdatedAtGstn: payload.lstupdt || null,
      fromCache: false,
    },
    rawResponse: raw,
  };
}

export async function verifyGst(gstNumber: string): Promise<GstVerificationResult> {
  const upper = gstNumber.toUpperCase().trim();

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
      centralJurisdiction: cached.centralJurisdiction ?? null,
      centralJurisdictionCode: cached.centralJurisdictionCode ?? null,
      dealerType: cached.dealerType ?? null,
      einvoiceStatus: cached.einvoiceStatus ?? null,
      cancellationDate: cached.cancellationDate ?? null,
      additionalAddresses: cached.additionalAddresses as unknown[] | null,
      lastUpdatedAtGstn: cached.lastUpdatedAtGstn ?? null,
      fromCache: true,
    };
  }

  const { result, rawResponse } = await fetchFromWhiteBooks(upper);

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
    centralJurisdiction: result.centralJurisdiction,
    centralJurisdictionCode: result.centralJurisdictionCode,
    dealerType: result.dealerType,
    einvoiceStatus: result.einvoiceStatus,
    cancellationDate: result.cancellationDate,
    additionalAddresses: result.additionalAddresses,
    lastUpdatedAtGstn: result.lastUpdatedAtGstn,
    lastVerifiedAt: new Date(),
    rawApiResponse: JSON.stringify(rawResponse),
  });

  return result;
}
