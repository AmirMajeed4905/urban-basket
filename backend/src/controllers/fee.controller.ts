import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";

import {
  createFeeStructureService,
  getFeeStructuresService,
  collectFeeService,
  getStudentFeeHistoryService,
  getDefaultersService,
  getFeeStatsService,
  getMonthlyFeeStatsService,
} from "../services/fee.service";

// safe query parser
const qs = (val: unknown): string | undefined =>
  Array.isArray(val) ? val[0] : (val as string | undefined);

const getMonthYear = (req: Request) => ({
  month: Number(qs(req.query.month)) || new Date().getMonth() + 1,
  year: Number(qs(req.query.year)) || new Date().getFullYear(),
});

// ───────── STRUCTURE ─────────

export const createFeeStructure = asyncHandler(async (req: Request, res: Response) => {
  const data = await createFeeStructureService(req.body, req.user!.userId);
  sendResponse(res, 201, "Fee structure created", data);
});

export const getFeeStructures = asyncHandler(async (req: Request, res: Response) => {
  const classId = qs(req.query.classId);
  const academicYearId = qs(req.query.academicYearId);

  const data = await getFeeStructuresService(classId, academicYearId);
  sendResponse(res, 200, "Fee structures fetched", data);
});

// ───────── COLLECT FEE ─────────

export const collectFee = asyncHandler(async (req: Request, res: Response) => {
  const data = await collectFeeService(req.body, req.user!.userId);
  sendResponse(res, 200, "Fee collected", data);
});

// ───────── STUDENT HISTORY ─────────

export const getStudentFeeHistory = asyncHandler(async (req: Request, res: Response) => {
  const studentId = qs(req.params.studentId);
  if (!studentId) throw new Error("Student ID required");

  const data = await getStudentFeeHistoryService(studentId);
  sendResponse(res, 200, "Fee history fetched", data);
});

// ───────── DEFAULTERS ─────────

export const getDefaulters = asyncHandler(async (req: Request, res: Response) => {
  const { month, year } = getMonthYear(req);
  const classId = qs(req.query.classId);

  const data = await getDefaultersService(month, year, classId);
  sendResponse(res, 200, "Defaulters fetched", data);
});

// ───────── STATS ─────────

export const getFeeStats = asyncHandler(async (req: Request, res: Response) => {
  const { month, year } = getMonthYear(req);

  const data = await getFeeStatsService(month, year);
  sendResponse(res, 200, "Fee stats fetched", data);
});

// ───────── MONTHLY STATS ─────────

export const getMonthlyFeeStats = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(qs(req.query.year)) || new Date().getFullYear();

  const data = await getMonthlyFeeStatsService(year);

  sendResponse(res, 200, "Monthly fee stats fetched", data);
});