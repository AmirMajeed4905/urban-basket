import { z } from "zod";

export const createFeeStructureSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Fee name is required" }).trim(),
    classId: z.string({ required_error: "Class is required" }),
    academicYearId: z.string({ required_error: "Academic year is required" }),
    amount: z.coerce.number().min(1),
    dueDay: z.coerce.number().min(1).max(28).default(10),
    lateFine: z.coerce.number().min(0).default(0),
  }),
});

export const collectFeeSchema = z.object({
  body: z.object({
    studentId: z.string({ required_error: "Student ID is required" }),
    feeStructureId: z.string({ required_error: "Fee structure is required" }),
    month: z.coerce.number().min(1).max(12),
    year: z.coerce.number().min(2020),
    amountPaid: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
    paymentMethod: z.enum(["cash", "bank_transfer", "cheque"]).default("cash"),
    remarks: z.string().optional(),
  }),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>["body"];
export type CollectFeeInput = z.infer<typeof collectFeeSchema>["body"];