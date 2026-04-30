import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createAdminService,
  getAllAdminsService,
  getAdminByIdService,
  updateAdminService,
  toggleAdminStatusService,
  deleteAdminService,
} from "../services/admin.service";

// POST /api/admins
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const admin = await createAdminService(req.body);
  sendResponse(res, 201, "Admin created successfully", admin);
});

// GET /api/admins
export const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;

  const result = await getAllAdminsService(page, limit, search);
  sendResponse(res, 200, "Admins fetched successfully", result);
});

// GET /api/admins/:id
export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const admin = await getAdminByIdService(req.params.id);
  sendResponse(res, 200, "Admin fetched successfully", admin);
});

// PATCH /api/admins/:id
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const admin = await updateAdminService(req.params.id, req.body);
  sendResponse(res, 200, "Admin updated successfully", admin);
});

// PATCH /api/admins/:id/toggle-status
export const toggleAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await toggleAdminStatusService(req.params.id);
  const msg = result.isActive ? "Admin activated" : "Admin deactivated";
  sendResponse(res, 200, msg, result);
});

// DELETE /api/admins/:id
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  await deleteAdminService(req.params.id);
  sendResponse(res, 200, "Admin deleted successfully");
});