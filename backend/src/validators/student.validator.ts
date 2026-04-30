import { z } from "zod";

const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

export const createStudentSchema = z.object({
  body: z.object({
    // Basic info
    name: z.string({ required_error: "Name is required" }).min(3).trim(),
    gender: genderEnum,
    dateOfBirth: z.string({ required_error: "Date of birth is required" }),
    religion: z.string().optional(),
    address: z.string().optional(),
    photo: z.string().url("Invalid photo URL").optional(),

    // Admission
    rollNo: z.string({ required_error: "Roll number is required" }).trim(),
    admissionNo: z.string({ required_error: "Admission number is required" }).trim(),
    admissionDate: z.string({ required_error: "Admission date is required" }),
    classId: z.string({ required_error: "Class is required" }),

    // Parent info
    fatherName: z.string({ required_error: "Father name is required" }).trim(),
    fatherPhone: z.string({ required_error: "Father phone is required" }),
    fatherCnic: z.string().optional(),
    motherName: z.string().optional(),
    motherPhone: z.string().optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(3).trim().optional(),
    gender: genderEnum.optional(),
    dateOfBirth: z.string().optional(),
    religion: z.string().optional(),
    address: z.string().optional(),
    photo: z.string().url().optional(),
    classId: z.string().optional(),
    fatherName: z.string().optional(),
    fatherPhone: z.string().optional(),
    fatherCnic: z.string().optional(),
    motherName: z.string().optional(),
    motherPhone: z.string().optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
  }),
});

export const transferStudentSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    transferDate: z.string({ required_error: "Transfer date is required" }),
    transferredTo: z.string({ required_error: "School name is required" }),
    reason: z.string().optional(),
    certificateNo: z.string().optional(),
    issuedBy: z.string().optional(),
  }),
});

export const studentIdSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const studentQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    classId: z.string().optional(),
    status: z.enum(["ACTIVE", "TRANSFERRED", "LEFT", "GRADUATED"]).optional(),
    gender: genderEnum.optional(),
  }),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>["body"];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>["body"];
export type TransferStudentInput = z.infer<typeof transferStudentSchema>["body"];