import { Router } from "express";
import { createExam, getAllExams, enterMarks, getResultsByExam } from "../controllers/exam.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createExamSchema, enterMarksSchema, examIdSchema } from "../validators/exam.validator";

const router = Router();
router.use(authenticate);

router.get("/", getAllExams);
router.post("/", validate(createExamSchema), createExam);
router.post("/marks", validate(enterMarksSchema), enterMarks);
router.get("/:examId/results", getResultsByExam);

export default router;