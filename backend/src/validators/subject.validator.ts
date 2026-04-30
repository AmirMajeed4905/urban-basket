import { z } from "zod";

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Subject name is required" }).trim(),
    code: z.string().optional(),
    classId: z.string({ required_error: "Class is required" }),
    totalMarks: z.coerce.number().min(1).default(100),
    passingMarks: z.coerce.number().min(1).default(40),
  }),
});

export const updateSubjectSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().trim().optional(),
    code: z.string().optional(),
    totalMarks: z.coerce.number().min(1).optional(),
    passingMarks: z.coerce.number().min(1).optional(),
  }),
});

export const subjectIdSchema = z.object({
  params: z.object({ id: z.string() }),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>["body"];
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>["body"];