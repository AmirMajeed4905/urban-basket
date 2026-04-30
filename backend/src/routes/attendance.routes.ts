import { Router } from "express";
import { markAttendance, getAttendance, getAttendanceSummary } from "../controllers/attendance.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { markAttendanceSchema } from "../validators/attendance.validator";

const router = Router();
router.use(authenticate);

router.post("/", validate(markAttendanceSchema), markAttendance);
router.get("/", getAttendance);
router.get("/summary/:studentId", getAttendanceSummary);

export default router;