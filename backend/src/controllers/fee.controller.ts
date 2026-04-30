import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createFeeStructureService, getFeeStructuresService,
  collectFeeService, getStudentFeeHistoryService,
  getDefaultersService, getFeeStatsService,
} from "../services/fee.service";

const qs = (val: unknown): string | undefined =>
  Array.isArray(val) ? val[0] : (val as string | undefined);

export const createFeeStructure = asyncHandler(async (req: Request, res: Response) => {
  const result = await createFeeStructureService(req.body, req.user!.userId);
  sendResponse(res, 201, "Fee structure created", result);
});

export const getFeeStructures = asyncHandler(async (req: Request, res: Response) => {
  const result = await getFeeStructuresService(qs(req.query.classId), qs(req.query.academicYearId));
  sendResponse(res, 200, "Fee structures fetched", result);
});

export const collectFee = asyncHandler(async (req: Request, res: Response) => {
  const result = await collectFeeService(req.body, req.user!.userId);
  sendResponse(res, 200, "Fee collected successfully", result);
});

export const getStudentFeeHistory = asyncHandler(async (req: Request, res: Response) => {
  const studentId = qs(req.params.studentId);
  if (!studentId) throw new Error("Student ID is required");
  const result = await getStudentFeeHistoryService(studentId);
  sendResponse(res, 200, "Fee history fetched", result);
});

export const getDefaulters = asyncHandler(async (req: Request, res: Response) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  const result = await getDefaultersService(month, year, qs(req.query.classId));
  sendResponse(res, 200, "Defaulters fetched", result);
});

export const getFeeStats = asyncHandler(async (req: Request, res: Response) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  const result = await getFeeStatsService(month, year);
  sendResponse(res, 200, "Fee stats fetched", result);
});