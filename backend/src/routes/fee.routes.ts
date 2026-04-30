import { Router } from "express";
import {
  createFeeStructure, getFeeStructures, collectFee,
  getStudentFeeHistory, getDefaulters, getFeeStats,
} from "../controllers/fee.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createFeeStructureSchema, collectFeeSchema } from "../validators/fee.validator";

const router = Router();
router.use(authenticate);

router.get("/stats", getFeeStats);
router.get("/defaulters", getDefaulters);
router.get("/structures", getFeeStructures);
router.post("/structures", validate(createFeeStructureSchema), createFeeStructure);
router.post("/collect", validate(collectFeeSchema), collectFee);
router.get("/student/:studentId", getStudentFeeHistory);

export default router;