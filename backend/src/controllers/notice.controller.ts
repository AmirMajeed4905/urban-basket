import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createNoticeService, getAllNoticesService,
  updateNoticeService, deleteNoticeService,
} from "../services/notice.service";

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
  const notice = await updateNoticeService(req.params.id, req.body);
  sendResponse(res, 200, "Notice updated", notice);
});

export const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
  await deleteNoticeService(req.params.id);
  sendResponse(res, 200, "Notice deleted");
});