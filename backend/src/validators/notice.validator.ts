import { z } from "zod";

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }).trim(),
    content: z.string({ required_error: "Content is required" }),
    target: z.enum(["ALL", "TEACHERS", "STUDENTS", "PARENTS", "STAFF"]).default("ALL"),
    isPinned: z.boolean().default(false),
    expiresAt: z.string().optional(),
  }),
});

export const updateNoticeSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().trim().optional(),
    content: z.string().optional(),
    isPinned: z.boolean().optional(),
    expiresAt: z.string().optional(),
  }),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>["body"];