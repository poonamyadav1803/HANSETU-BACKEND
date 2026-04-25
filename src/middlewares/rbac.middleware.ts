import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { HttpException } from "../core/HttpException";

/**
 * Requires the authenticated user to have one of the specified roles.
 * Must be used after authMiddleware.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(
        new HttpException(403, "Access denied. You do not have permission to perform this action.")
      );
    }
    next();
  };
}

/**
 * Convenience shorthand — requires the 'admin' role.
 */
export const requireAdmin = requireRole("admin");
