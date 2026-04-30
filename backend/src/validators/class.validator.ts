import { z } from "zod";

export const createClassSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Class name is required" }).trim(),
    section: z.string({ required_error: "Section is required" }).trim(),
    academicYearId: z.string({ required_error: "Academic year is required" }),
    capacity: z.coerce.number().min(1).max(100).default(40),
  }),
});

export const updateClassSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(1).optional(),
    section: z.string().min(1).optional(),
    capacity: z.number().int().positive().optional(),
    // academicYear, _count etc allowed nahi — yahan nahi hain
  }),
});

export const classIdSchema = z.object({
  params: z.object({ id: z.string() }),
});

export type CreateClassInput = z.infer<typeof createClassSchema>["body"];
export type UpdateClassInput = z.infer<typeof updateClassSchema>["body"];