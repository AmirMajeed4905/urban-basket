import { Router } from "express";
import { createNotice, getAllNotices, updateNotice, deleteNotice } from "../controllers/notice.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createNoticeSchema, updateNoticeSchema } from "../validators/notice.validator";

const router = Router();
router.use(authenticate);

router.get("/", getAllNotices);
router.post("/", validate(createNoticeSchema), createNotice);
router.patch("/:id", validate(updateNoticeSchema), updateNotice);
router.delete("/:id", deleteNotice);

export default router;