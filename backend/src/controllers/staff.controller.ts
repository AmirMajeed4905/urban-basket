import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  createStaffService,
  getAllStaffService,
  getStaffByIdService,
  updateStaffService,
  toggleStaffStatusService,
  createLeaveRequestService,
  updateLeaveStatusService,
  getStaffStatsService,
} from "../services/staff.service";

import { deleteStaffService } from "../services/staff.service";



const qs = (val: unknown): string | undefined =>
  Array.isArray(val) ? val[0] : (val as string | undefined);

const idFromParam = (val: string | string[] | undefined): string =>
  Array.isArray(val) ? val[0] : (val ?? "");

/**
 * IMPORTANT FIX:
 * Prisma DateTime needs proper ISO format
 */
const toISODate = (date: unknown) => {
  if (!date) return undefined;
  const d = new Date(date as string);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

// ───────────────────────── CREATE ─────────────────────────
export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    joinDate: toISODate(req.body.joinDate),
    salary: Number(req.body.salary),
  };

  const staff = await createStaffService(payload);
  sendResponse(res, 201, "Staff created successfully", staff);
});

// ───────────────────────── GET ALL ─────────────────────────
export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllStaffService({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: qs(req.query.search),
    staffType: qs(req.query.staffType) as any,
    isActive:
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined,
  });

  sendResponse(res, 200, "Staff fetched successfully", result);
});

// ───────────────────────── STATS ─────────────────────────
export const getStaffStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getStaffStatsService();
  sendResponse(res, 200, "Stats fetched", stats);
});

// ───────────────────────── GET BY ID ─────────────────────────
export const getStaffById = asyncHandler(async (req: Request, res: Response) => {
  const staff = await getStaffByIdService(idFromParam(req.params.id));
  sendResponse(res, 200, "Staff fetched successfully", staff);
});

// ───────────────────────── UPDATE (FIXED) ─────────────────────────
export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = idFromParam(req.params.id);

  const payload = {
    ...req.body,
    joinDate: req.body.joinDate
      ? toISODate(req.body.joinDate)
      : undefined,
    salary: req.body.salary ? Number(req.body.salary) : undefined,
  };

  const staff = await updateStaffService(id, payload);
  sendResponse(res, 200, "Staff updated successfully", staff);
});

// ───────────────────────── TOGGLE STATUS ─────────────────────────
export const toggleStaffStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await toggleStaffStatusService(idFromParam(req.params.id));

  sendResponse(
    res,
    200,
    result.isActive ? "Staff activated" : "Staff deactivated",
    result
  );
});

// ───────────────────────── LEAVE ─────────────────────────
export const createLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
  const leave = await createLeaveRequestService(req.body);
  sendResponse(res, 201, "Leave request created", leave);
});

export const updateLeaveStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateLeaveStatusService(
    idFromParam(req.params.id),
    req.body.status,
    req.user!.userId
  );

  sendResponse(res, 200, "Leave status updated", result);
});


export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await deleteStaffService(idFromParam(req.params.id));

  sendResponse(res, 200, "Staff deleted successfully", staff);
});