import { Request, Response, NextFunction } from "express";
import { HttpException } from "../core/HttpException";
import { logError } from "../utils/logger";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpException) {
    return res.status(err.status).json({ message: err.message });
  }

  logError(err.message);
  res.status(500).json({ message: "Internal Server Error" });
}
