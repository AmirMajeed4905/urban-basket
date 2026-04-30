import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createClassService,
  getAllClassesService,
  getClassByIdService,
  updateClassService,
  deleteClassService,
  getAcademicYearsService,
} from "../services/class.service";

// GET /api/classes/academic-years
export const getAcademicYears = asyncHandler(async (_req: Request, res: Response) => {
  const years = await getAcademicYearsService();
  sendResponse(res, 200, "Academic years fetched", years);
});

// POST /api/classes
export const createClass = asyncHandler(async (req: Request, res: Response) => {
  const cls = await createClassService(req.body);
  sendResponse(res, 201, "Class created successfully", cls);
});

// GET /api/classes
export const getAllClasses = asyncHandler(async (req: Request, res: Response) => {
  const academicYearId = req.query.academicYearId as string | undefined;
  const classes = await getAllClassesService(academicYearId);
  sendResponse(res, 200, "Classes fetched successfully", classes);
});

// GET /api/classes/:id
export const getClassById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const cls = await getClassByIdService(id);
  sendResponse(res, 200, "Class fetched successfully", cls);
});

// PATCH /api/classes/:id
export const updateClass = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const cls = await updateClassService(id, req.body);
  sendResponse(res, 200, "Class updated successfully", cls);
});

// DELETE /api/classes/:id
export const deleteClass = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await deleteClassService(id);
  sendResponse(res, 200, "Class deleted successfully");
});