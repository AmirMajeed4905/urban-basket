import { Router } from "express";
import {
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  changePassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { loginSchema, changePasswordSchema } from "../validators/auth.validator";

const router = Router();

// Public routes — token ki zaroorat nahi
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);

// Protected routes — valid access token chahiye
router.post("/logout", logout); // Logout pe token optional — already expired bhi ho sakta
router.post("/logout-all", authenticate, logoutAll);
router.get("/me", authenticate, getMe);
router.patch("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
