import { Router } from "express";
import {
  createFeeStructure,
  getFeeStructures,
  collectFee,
  getStudentFeeHistory,
  getDefaulters,
  getFeeStats,
  getMonthlyFeeStats,
} from "../controllers/fee.controller";

import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createFeeStructureSchema,
  collectFeeSchema,
} from "../validators/fee.validator";

const router = Router();

router.use(authenticate);

// fee structure
router.get("/structures", getFeeStructures);
router.post("/structures", validate(createFeeStructureSchema), createFeeStructure);

// fee operations
router.post("/collect", validate(collectFeeSchema), collectFee);
router.get("/student/:studentId", getStudentFeeHistory);

// stats
router.get("/stats", getFeeStats);
router.get("/monthly-stats", getMonthlyFeeStats);
router.get("/defaulters", getDefaulters);

export default router;