import { z } from "zod";

export const createAdminSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(3, "Name must be at least 3 characters")
      .trim(),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    phone: z.string().optional(),
  }),
});

export const updateAdminSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Admin ID is required"),
  }),
  body: z.object({
    name: z.string().min(3).trim().optional(),
    phone: z.string().optional(),
    avatar: z.string().url("Invalid avatar URL").optional(),
  }),
});

export const adminIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Admin ID is required"),
  }),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>["body"];
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>["body"];