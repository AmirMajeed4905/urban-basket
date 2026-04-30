import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createStudentService,
  getAllStudentsService,
  getStudentByIdService,
  updateStudentService,
  transferStudentService,
  deleteStudentService,
  getStudentStatsService,
} from "../services/student.service";

// Helper — query string ko safely string banao
const qs = (val: unknown): string | undefined =>
  Array.isArray(val) ? val[0] : (val as string | undefined);

// POST /api/students
export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await createStudentService(req.body);
  sendResponse(res, 201, "Student enrolled successfully", student);
});

// GET /api/students
export const getAllStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllStudentsService({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: qs(req.query.search),
    classId: qs(req.query.classId),
    status: qs(req.query.status) as any,
    gender: qs(req.query.gender),
  });
  sendResponse(res, 200, "Students fetched successfully", result);
});

// GET /api/students/stats
export const getStudentStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getStudentStatsService();
  sendResponse(res, 200, "Stats fetched", stats);
});

// GET /api/students/:id
export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByIdService(qs(req.params.id)!);
  sendResponse(res, 200, "Student fetched successfully", student);
});

// PATCH /api/students/:id
export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await updateStudentService(qs(req.params.id)!, req.body);
  sendResponse(res, 200, "Student updated successfully", student);
});

// POST /api/students/:id/transfer
export const transferStudent = asyncHandler(async (req: Request, res: Response) => {
  await transferStudentService(qs(req.params.id)!, req.body);
  sendResponse(res, 200, "Student transferred successfully");
});

// DELETE /api/students/:id
export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  await deleteStudentService(qs(req.params.id)!);
  sendResponse(res, 200, "Student marked as left");
});