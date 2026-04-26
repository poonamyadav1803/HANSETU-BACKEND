import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpException } from "../core/HttpException";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return next(new HttpException(401, "Authentication required."));
  }
  try {
    const decoded = jwt.verify(auth.slice(7), env.JWT_SECRET) as {
      userId: string;
      role: string;
    };
    req.userId = decoded.userId;
    req.userRole = decoded.role ?? "user";
    next();
  } catch {
    next(new HttpException(401, "Invalid or expired token."));
  }
}
