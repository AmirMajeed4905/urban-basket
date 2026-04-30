import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createSubjectService,
  getSubjectsByClassService,
  getAllSubjectsService,
  updateSubjectService,
  deleteSubjectService,
} from "../services/subject.service";

// SAFE PARAM HELPER
const getIdFromParams = (id: string | string[] | undefined): string => {
  if (!id) throw new Error("Id is required");
  return Array.isArray(id) ? id[0] : id;
};

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const subject = await createSubjectService(req.body);
  sendResponse(res, 201, "Subject created successfully", subject);
});

export const getAllSubjects = asyncHandler(async (_req: Request, res: Response) => {
  const subjects = await getAllSubjectsService();
  sendResponse(res, 200, "Subjects fetched", subjects);
});

export const getSubjectsByClass = asyncHandler(async (req: Request, res: Response) => {
  const classId = getIdFromParams(req.params.classId);

  const subjects = await getSubjectsByClassService(classId);
  sendResponse(res, 200, "Subjects fetched", subjects);
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  const subject = await updateSubjectService(id, req.body);
  sendResponse(res, 200, "Subject updated", subject);
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  await deleteSubjectService(id);
  sendResponse(res, 200, "Subject deleted");
});