import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpException } from "../core/HttpException";
import { logError } from "../utils/logger";

function safeMessage(value: unknown): string | null {
  if (typeof value === "string" && value && value !== "[object Object]") {
    return value;
  }
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as any).message;
    if (typeof msg === "string" && msg && msg !== "[object Object]") return msg;
  }
  return null;
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known HTTP errors
  if (err instanceof HttpException) {
    return res.status(err.status).json({ message: err.message });
  }

  // Zod validation errors — return field-level messages
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => {
      const field = e.path.join(".");
      return field ? `${field}: ${e.message}` : e.message;
    });
    return res.status(400).json({ message: "Validation failed", errors });
  }

  // Express JSON body parse error
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }

  // Plain Error — extract message safely
  if (err instanceof Error) {
    const msg = safeMessage(err.message) ?? safeMessage(err.cause) ?? err.name;
    logError(`${err.name}: ${err.message}`);
    return res.status(400).json({ message: msg });
  }

  // Non-Error thrown value (e.g. throw { message: "..." } or throw "string")
  const msg = safeMessage(err) ?? "An unexpected error occurred";
  logError(`Unknown error: ${JSON.stringify(err)}`);
  res.status(500).json({ message: msg });
}
