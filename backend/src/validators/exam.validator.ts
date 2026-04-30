import { z } from "zod";

const examTypeEnum = z.enum(["MIDTERM", "FINAL", "UNIT_TEST", "ASSIGNMENT", "PRACTICAL"]);

export const createExamSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Exam name is required" }).trim(),
    examType: examTypeEnum,
    academicYearId: z.string({ required_error: "Academic year is required" }),
    startDate: z.string({ required_error: "Start date is required" }),
    endDate: z.string({ required_error: "End date is required" }),
  }),
});

export const enterMarksSchema = z.object({
  body: z.object({
    examId: z.string({ required_error: "Exam ID is required" }),
    subjectId: z.string({ required_error: "Subject ID is required" }),
    marks: z.array(z.object({
      studentId: z.string(),
      obtainedMarks: z.coerce.number().min(0),
      remarks: z.string().optional(),
    })).min(1),
  }),
});

export const examIdSchema = z.object({
  params: z.object({ id: z.string() }),
});

export type CreateExamInput = z.infer<typeof createExamSchema>["body"];
export type EnterMarksInput = z.infer<typeof enterMarksSchema>["body"];