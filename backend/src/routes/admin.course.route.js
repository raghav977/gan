import express from "express";
import { authMiddleware, adminAuthMiddleware } from "../middlewares/auth.js";
import { getAdminCoursesController } from "../controllers/admin.course.controller.js";

const router = express.Router();

router.get("/", authMiddleware, adminAuthMiddleware, getAdminCoursesController);

export default router;
