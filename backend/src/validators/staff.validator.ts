import { z } from "zod";

const staffTypeEnum = z.enum(["TEACHER", "CLERK", "PEON", "ACCOUNTANT", "OTHER"]);
const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
const leaveStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const createStaffSchema = z.object({
  body: z.object({
    employeeNo: z.string({ required_error: "Employee number is required" }).trim(),
    name: z.string({ required_error: "Name is required" }).min(3).trim(),
    gender: genderEnum,
    cnic: z.string().optional(),
    phone: z.string({ required_error: "Phone is required" }),
    email: z.string().email().optional(),
    address: z.string().optional(),
    staffType: staffTypeEnum,
    designation: z.string().optional(),
    joinDate: z.string({ required_error: "Join date is required" }),
    salary: z.coerce.number({ required_error: "Salary is required" }).min(0),
  }),
});

export const updateStaffSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(3).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    designation: z.string().optional(),
    salary: z.coerce.number().min(0).optional(),
  }),
});

export const leaveRequestSchema = z.object({
  body: z.object({
    staffId: z.string({ required_error: "Staff ID is required" }),
    fromDate: z.string({ required_error: "From date is required" }),
    toDate: z.string({ required_error: "To date is required" }),
    reason: z.string({ required_error: "Reason is required" }),
  }),
});

export const updateLeaveStatusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: leaveStatusEnum,
  }),
});

export const staffIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Staff ID is required"),
  }),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>["body"];
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>["body"];
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>["body"];