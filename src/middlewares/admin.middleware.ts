import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpException } from "../core/HttpException";

export interface AdminRequest extends Request {
  adminId?: string;
}

export function adminMiddleware(req: AdminRequest, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return next(new HttpException(401, "Admin authentication required."));
  }
  try {
    const decoded = jwt.verify(auth.slice(7), env.JWT_SECRET) as {
      adminId: string;
      role: string;
    };
    if (!decoded.adminId || decoded.role !== "admin") {
      return next(new HttpException(403, "Admin access required."));
    }
    req.adminId = decoded.adminId;
    next();
  } catch {
    next(new HttpException(401, "Invalid or expired token."));
  }
}
