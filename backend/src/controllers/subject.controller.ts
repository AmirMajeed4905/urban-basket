import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createSubjectService, getSubjectsByClassService,
  getAllSubjectsService, updateSubjectService, deleteSubjectService,
} from "../services/subject.service";

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const subject = await createSubjectService(req.body);
  sendResponse(res, 201, "Subject created successfully", subject);
});

export const getAllSubjects = asyncHandler(async (_req: Request, res: Response) => {
  const subjects = await getAllSubjectsService();
  sendResponse(res, 200, "Subjects fetched", subjects);
});

export const getSubjectsByClass = asyncHandler(async (req: Request, res: Response) => {
  const subjects = await getSubjectsByClassService(req.params.classId);
  sendResponse(res, 200, "Subjects fetched", subjects);
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const subject = await updateSubjectService(req.params.id, req.body);
  sendResponse(res, 200, "Subject updated", subject);
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  await deleteSubjectService(req.params.id);
  sendResponse(res, 200, "Subject deleted");
});