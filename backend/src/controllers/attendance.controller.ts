import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  markAttendanceService, getAttendanceService, getAttendanceSummaryService,
} from "../services/attendance.service";

const qs = (val: unknown): string | undefined =>
  Array.isArray(val) ? val[0] : (val as string | undefined);

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const result = await markAttendanceService(req.body);
  sendResponse(res, 200, "Attendance marked successfully", result);
});

export const getAttendance = asyncHandler(async (req: Request, res: Response) => {
  const records = await getAttendanceService({
    classId: qs(req.query.classId),
    studentId: qs(req.query.studentId),
    subjectId: qs(req.query.subjectId),
    fromDate: qs(req.query.fromDate),
    toDate: qs(req.query.toDate),
    month: req.query.month ? Number(req.query.month) : undefined,
    year: req.query.year ? Number(req.query.year) : undefined,
  });
  sendResponse(res, 200, "Attendance fetched", records);
});

export const getAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const studentIdStr = Array.isArray(studentId) ? studentId[0] : studentId;
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  const summary = await getAttendanceSummaryService(studentIdStr, month, year);
  sendResponse(res, 200, "Attendance summary fetched", summary);
});