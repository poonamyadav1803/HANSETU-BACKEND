import { HttpException } from "./HttpException";

// ─── Status Type Unions ───────────────────────────────────────────────────────

export type RfqStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SUPPLIER_ASSIGNED"
  | "NEGOTIATING"
  | "QUOTE_FINALIZED"
  | "PO_RAISED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CLOSED"
  | "CANCELLED";

export type NegotiationStatus =
  | "PENDING_SUPPLIER"
  | "SUPPLIER_ACCEPTED"
  | "SUPPLIER_COUNTERED"
  | "ADMIN_REVIEWING"
  | "FINALIZED"
  | "REJECTED";

export type NegotiationRoundStatus = "PENDING" | "ACCEPTED" | "COUNTERED" | "REJECTED";

export type PoStatus =
  | "ISSUED"
  | "CONFIRMED"
  | "INVOICE_UPLOADED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CLOSED";

export type InvoiceStatus = "ISSUED" | "PAID" | "CANCELLED";

export type ShipmentStatus =
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RECEIVED";

// ─── Transition Maps ──────────────────────────────────────────────────────────

const RFQ_TRANSITIONS: Record<RfqStatus, RfqStatus[]> = {
  SUBMITTED:         ["UNDER_REVIEW", "SUPPLIER_ASSIGNED", "CANCELLED"],
  UNDER_REVIEW:      ["SUPPLIER_ASSIGNED", "CANCELLED"],
  SUPPLIER_ASSIGNED: ["NEGOTIATING", "QUOTE_FINALIZED", "CANCELLED"],
  NEGOTIATING:       ["QUOTE_FINALIZED", "CANCELLED"],
  QUOTE_FINALIZED:   ["PO_RAISED", "CANCELLED"],
  PO_RAISED:         ["DISPATCHED", "CANCELLED"],
  DISPATCHED:        ["DELIVERED"],
  DELIVERED:         ["CLOSED"],
  CLOSED:            [],
  CANCELLED:         [],
};

const NEGOTIATION_TRANSITIONS: Record<NegotiationStatus, NegotiationStatus[]> = {
  PENDING_SUPPLIER:   ["SUPPLIER_ACCEPTED", "SUPPLIER_COUNTERED"],
  SUPPLIER_ACCEPTED:  ["FINALIZED"],
  SUPPLIER_COUNTERED: ["ADMIN_REVIEWING"],
  ADMIN_REVIEWING:    ["FINALIZED", "PENDING_SUPPLIER", "REJECTED"],
  FINALIZED:          [],
  REJECTED:           [],
};

const PO_TRANSITIONS: Record<PoStatus, PoStatus[]> = {
  ISSUED:           ["CONFIRMED", "CLOSED"],
  CONFIRMED:        ["INVOICE_UPLOADED"],
  INVOICE_UPLOADED: ["DISPATCHED"],
  DISPATCHED:       ["DELIVERED"],
  DELIVERED:        ["CLOSED"],
  CLOSED:           [],
};

const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  ISSUED:    ["PAID", "CANCELLED"],
  PAID:      [],
  CANCELLED: [],
};

const SHIPMENT_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  DISPATCHED:       ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"],
  IN_TRANSIT:       ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED:        ["RECEIVED"],
  RECEIVED:         [],
};

// ─── Guard Helper ─────────────────────────────────────────────────────────────

function guard<T extends string>(
  entityType: string,
  transitions: Record<T, T[]>,
  from: T,
  to: T
): void {
  const allowed = transitions[from];
  if (!allowed || !allowed.includes(to)) {
    throw new HttpException(
      400,
      `Invalid ${entityType} transition: ${from} → ${to}. ` +
        `Allowed next states: ${allowed?.join(", ") || "none"}.`
    );
  }
}

// ─── Public Guard Functions ───────────────────────────────────────────────────

export function guardRfqTransition(from: RfqStatus, to: RfqStatus): void {
  guard("RFQ", RFQ_TRANSITIONS, from, to);
}

export function guardNegotiationTransition(
  from: NegotiationStatus,
  to: NegotiationStatus
): void {
  guard("Negotiation", NEGOTIATION_TRANSITIONS, from, to);
}

export function guardPoTransition(from: PoStatus, to: PoStatus): void {
  guard("Purchase Order", PO_TRANSITIONS, from, to);
}

export function guardInvoiceTransition(from: InvoiceStatus, to: InvoiceStatus): void {
  guard("Sales Invoice", INVOICE_TRANSITIONS, from, to);
}

export function guardShipmentTransition(from: ShipmentStatus, to: ShipmentStatus): void {
  guard("Shipment", SHIPMENT_TRANSITIONS, from, to);
}

// ─── Allowed-Next Helpers (for UI "what can I do next?" queries) ──────────────

export function nextRfqStatuses(from: RfqStatus): RfqStatus[] {
  return RFQ_TRANSITIONS[from] ?? [];
}

export function nextPoStatuses(from: PoStatus): PoStatus[] {
  return PO_TRANSITIONS[from] ?? [];
}

export function nextShipmentStatuses(from: ShipmentStatus): ShipmentStatus[] {
  return SHIPMENT_TRANSITIONS[from] ?? [];
}
