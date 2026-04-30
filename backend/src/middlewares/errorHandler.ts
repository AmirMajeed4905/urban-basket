import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── 1. Hamari apni ApiError ──────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
    return;
  }

  // ── 2. Zod Validation Error ──────────────────────────────
  if (err instanceof ZodError) {
    const errors = err.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // ── 3. JWT Errors ────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: "Token expired, please login again",
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  // ── 4. Prisma Errors ─────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (P2002)
    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") ?? "field";
      res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
      return;
    }

    // Record not found (P2025)
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }
  }

  // ── 5. Unknown / Unexpected Errors ──────────────────────
  console.error("❌ Unexpected Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    // Stack trace sirf development mein dikhao
    ...(env.NODE_ENV === "development" && {
      stack: err instanceof Error ? err.stack : String(err),
    }),
  });
};
