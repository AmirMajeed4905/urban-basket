import { z } from "zod";

// ─── Fee Structure ────────────────────────────────────────────────────────────

export const createFeeStructureSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Fee name is required" })
      .trim()
      .min(1, "Fee name cannot be empty"),
    classId: z.string({ required_error: "Class is required" }).cuid("Invalid class ID"),
    academicYearId: z
      .string({ required_error: "Academic year is required" })
      .cuid("Invalid academic year ID"),
    amount: z.coerce.number({ required_error: "Amount is required" }).min(1, "Amount must be at least 1"),
    dueDay: z.coerce.number().min(1).max(28).default(10),
    lateFine: z.coerce.number().min(0).default(0),
  }),
});

// ─── Collect Fee ──────────────────────────────────────────────────────────────

export const collectFeeSchema = z.object({
  body: z.object({
    studentId: z.string({ required_error: "Student ID is required" }).cuid("Invalid student ID"),
    feeStructureId: z
      .string({ required_error: "Fee structure is required" })
      .cuid("Invalid fee structure ID"),
    month: z.coerce
      .number({ required_error: "Month is required" })
      .min(1, "Month must be between 1-12")
      .max(12, "Month must be between 1-12"),
    year: z.coerce.number({ required_error: "Year is required" }).min(2020, "Year must be 2020 or later"),
    amountPaid: z.coerce.number({ required_error: "Amount paid is required" }).min(0),
    discount: z.coerce.number().min(0).default(0),
    paymentMethod: z.enum(["cash", "bank_transfer", "cheque"]).default("cash"),
    remarks: z.string().trim().optional(),
  }),
});

// ─── Query Schemas ────────────────────────────────────────────────────────────

export const feeStatsQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2020).optional(),
  }),
});

export const defaultersQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2020).optional(),
    classId: z.string().cuid().optional(),
  }),
});

export const feeStructureQuerySchema = z.object({
  query: z.object({
    classId: z.string().cuid().optional(),
    academicYearId: z.string().cuid().optional(),
  }),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>["body"];
export type CollectFeeInput = z.infer<typeof collectFeeSchema>["body"];
export type FeeStatsQuery = z.infer<typeof feeStatsQuerySchema>["query"];
export type DefaultersQuery = z.infer<typeof defaultersQuerySchema>["query"];
export type FeeStructureQuery = z.infer<typeof feeStructureQuerySchema>["query"];