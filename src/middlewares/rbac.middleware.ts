import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { HttpException } from "../core/HttpException";

// ─── Role Constants ───────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN:    "admin",
  SUPPLIER: "supplier",
  USER:     "user",      // buyer / regular registered user
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

// ─── Core Guard ───────────────────────────────────────────────────────────────

/**
 * Requires the authenticated user to have one of the specified roles.
 * Must be used after authMiddleware.
 */
export function requireRole(...roles: AppRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole as AppRole)) {
      return next(
        new HttpException(403, "Access denied. You do not have permission to perform this action.")
      );
    }
    next();
  };
}

// ─── Convenience Shorthands ───────────────────────────────────────────────────

/** Admin-only routes */
export const requireAdmin = requireRole(ROLES.ADMIN);

/** Supplier-only routes (e.g. confirm PO, upload invoice, create shipment) */
export const requireSupplier = requireRole(ROLES.SUPPLIER);

/** Buyer routes (regular authenticated user) */
export const requireBuyer = requireRole(ROLES.USER);

/** Any authenticated user regardless of role (admin, supplier, or buyer) */
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.userId) {
    return next(new HttpException(401, "Authentication required."));
  }
  next();
}

/**
 * Allows multiple roles — useful for routes shared between roles.
 * Example: requireAnyRole(ROLES.ADMIN, ROLES.SUPPLIER)
 */
export const requireAnyRole = requireRole;
