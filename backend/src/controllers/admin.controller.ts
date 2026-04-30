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

// SAFE ID extractor
const getIdFromParams = (id: string | string[] | undefined): string => {
  if (!id) throw new Error("Admin id is required");
  return Array.isArray(id) ? id[0] : id;
};

// POST
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const admin = await createAdminService(req.body);
  sendResponse(res, 201, "Admin created successfully", admin);
});

// GET ALL
export const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  const result = await getAllAdminsService(page, limit, search);
  sendResponse(res, 200, "Admins fetched successfully", result);
});

// GET BY ID
export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  const admin = await getAdminByIdService(id);
  sendResponse(res, 200, "Admin fetched successfully", admin);
});

// UPDATE
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  const admin = await updateAdminService(id, req.body);
  sendResponse(res, 200, "Admin updated successfully", admin);
});

// TOGGLE STATUS
export const toggleAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  const result = await toggleAdminStatusService(id);
  const msg = result.isActive ? "Admin activated" : "Admin deactivated";

  sendResponse(res, 200, msg, result);
});

// DELETE
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params.id);

  await deleteAdminService(id);
  sendResponse(res, 200, "Admin deleted successfully");
});