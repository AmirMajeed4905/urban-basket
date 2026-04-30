import { Router } from "express";
import {
  createSubject, getAllSubjects, getSubjectsByClass,
  updateSubject, deleteSubject,
} from "../controllers/subject.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createSubjectSchema, updateSubjectSchema, subjectIdSchema } from "../validators/subject.validator";

const router = Router();
router.use(authenticate);

router.get("/", getAllSubjects);
router.post("/", validate(createSubjectSchema), createSubject);
router.get("/class/:classId", getSubjectsByClass);
router.patch("/:id", validate(updateSubjectSchema), updateSubject);
router.delete("/:id", validate(subjectIdSchema), deleteSubject);

export default router;