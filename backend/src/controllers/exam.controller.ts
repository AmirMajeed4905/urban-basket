import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createExamService, getAllExamsService,
  enterMarksService, getResultsByExamService,
} from "../services/exam.service";

const qs = (val: unknown): string | undefined =>
  Array.isArray(val) ? val[0] : (val as string | undefined);

export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await createExamService(req.body);
  sendResponse(res, 201, "Exam created successfully", exam);
});

export const getAllExams = asyncHandler(async (req: Request, res: Response) => {
  const exams = await getAllExamsService(qs(req.query.academicYearId));
  sendResponse(res, 200, "Exams fetched", exams);
});

export const enterMarks = asyncHandler(async (req: Request, res: Response) => {
  const result = await enterMarksService(req.body);
  sendResponse(res, 200, "Marks saved successfully", result);
});

export const getResultsByExam = asyncHandler(async (req: Request, res: Response) => {
  const classId = qs(req.query.classId);
  if (!classId) {
    res.status(400).json({ success: false, message: "classId is required" });
    return;
  }
  const results = await getResultsByExamService(req.params.examId, classId);
  sendResponse(res, 200, "Results fetched", results);
});