import { Router } from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  getStaffStats,
  updateStaff,
  toggleStaffStatus,
  createLeaveRequest,
  updateLeaveStatus,
  deleteStaff,
} from "../controllers/staff.controller";

import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";

import {
  createStaffSchema,
  updateStaffSchema,
  staffIdSchema,
  leaveRequestSchema,
  updateLeaveStatusSchema,
} from "../validators/staff.validator";

const router = Router();

router.use(authenticate);

/* =========================
   STAFF ROUTES
========================= */

router.get("/stats", getStaffStats);

router.get("/", getAllStaff);

router.post(
  "/",
  validate(createStaffSchema),
  createStaff
);

router.get(
  "/:id",
  validate(staffIdSchema),
  getStaffById
);

/*
IMPORTANT:
Frontend uses api.put(...)
so backend must also use PUT
not PATCH
*/

router.patch(
  "/:id",
  validate(updateStaffSchema),
  updateStaff
);

router.patch(
  "/:id/toggle-status",
  validate(staffIdSchema),
  toggleStaffStatus
);

router.delete(
  "/:id",
  validate(staffIdSchema),
  deleteStaff
);

/* =========================
   LEAVE REQUEST ROUTES
========================= */

router.post(
  "/leave-requests",
  validate(leaveRequestSchema),
  createLeaveRequest
);

router.patch(
  "/leave-requests/:id/status",
  validate(updateLeaveStatusSchema),
  updateLeaveStatus
);

export default router;