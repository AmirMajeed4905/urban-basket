import { Router } from "express";
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} from "../controllers/admin.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { protectSuperAdmin } from "../middlewares/protectSuperAdmin";
import { validate } from "../middlewares/validate";
import {
  createAdminSchema,
  updateAdminSchema,
  adminIdSchema,
} from "../validators/admin.validator";

const router = Router();

// Sab routes pe authenticate + SUPER_ADMIN only
router.use(authenticate, authorize("SUPER_ADMIN"));

router.post("/", validate(createAdminSchema), createAdmin);
router.get("/", getAllAdmins);
router.get("/:id", validate(adminIdSchema), getAdminById);
router.patch("/:id", protectSuperAdmin, validate(updateAdminSchema), updateAdmin);
router.patch("/:id/toggle-status", protectSuperAdmin, toggleAdminStatus);
router.delete("/:id", protectSuperAdmin, deleteAdmin);

export default router;