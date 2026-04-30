import { Router } from "express";
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  getAcademicYears,
} from "../controllers/class.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createClassSchema,
  updateClassSchema,
  classIdSchema,
} from "../validators/class.validator";

const router = Router();

router.use(authenticate);

// Academic years dropdown — students enroll karne se pehle chahiye
router.get("/academic-years", getAcademicYears);

router.get("/", getAllClasses);
router.post("/", validate(createClassSchema), createClass);
router.get("/:id", validate(classIdSchema), getClassById);
router.patch("/:id", validate(updateClassSchema), updateClass);
router.delete("/:id", validate(classIdSchema), deleteClass);

export default router;