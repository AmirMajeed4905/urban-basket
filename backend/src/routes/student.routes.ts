import { Router } from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentStats,
  updateStudent,
  transferStudent,
  deleteStudent,
} from "../controllers/student.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createStudentSchema,
  updateStudentSchema,
  transferStudentSchema,
  studentIdSchema,
} from "../validators/student.validator";

const router = Router();

// Sab routes protected — Admin aur Super Admin dono access kar sakte hain
router.use(authenticate);

router.get("/stats", getStudentStats);
router.get("/", getAllStudents);
router.post("/", validate(createStudentSchema), createStudent);
router.get("/:id", validate(studentIdSchema), getStudentById);
router.patch("/:id", validate(updateStudentSchema), updateStudent);
router.post("/:id/transfer", validate(transferStudentSchema), transferStudent);
router.delete("/:id", validate(studentIdSchema), deleteStudent);

export default router;