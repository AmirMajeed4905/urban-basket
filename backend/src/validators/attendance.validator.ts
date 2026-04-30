import { z } from "zod";

const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE"]);

export const markAttendanceSchema = z.object({
  body: z.object({
    classId: z.string({ required_error: "Class ID is required" }),
    subjectId: z.string().optional(),
    date: z.string({ required_error: "Date is required" }),
    records: z.array(z.object({
      studentId: z.string({ required_error: "Student ID is required" }),
      subjectId: z.string().optional(),
      status: attendanceStatusEnum,
      remarks: z.string().optional(),
    })).min(1, "At least one record is required"),
  }),
});

export const getAttendanceSchema = z.object({
  query: z.object({
    classId: z.string().optional(),
    studentId: z.string().optional(),
    subjectId: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().optional(),
  }),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>["body"];