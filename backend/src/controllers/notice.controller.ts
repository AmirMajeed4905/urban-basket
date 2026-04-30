import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createNoticeService,
  getAllNoticesService,
  updateNoticeService,
  deleteNoticeService,
} from "../services/notice.service";

// SAFE ID helper
const getIdFromParams = (id: string | string[] | undefined): string => {
  if (!id) throw new Error("Notice id is required");
  return Array.isArray(id) ? id[0] : id;
};

export const createNotice = asyncHandler(async (req: Request, res: Response) => {
  const notice = await createNoticeService(req.body, req.user!.userId);
  sendResponse(res, 201, "Notice created", notice);
});

export const getAllNotices = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllNoticesService(
    Number(req.query.page) || 1,
    Number(req.query.limit) || 10
  );

  sendResponse(res, 200, "Notices fetched", result);
});

export const updateNotice = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  const notice = await updateNoticeService(id, req.body);
  sendResponse(res, 200, "Notice updated", notice);
});

export const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  await deleteNoticeService(id);
  sendResponse(res, 200, "Notice deleted");
});