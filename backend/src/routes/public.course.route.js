import express from "express"
import { getPublicCoursesController, getPublicCourseDetailController } from "../controllers/public.course.controller.js";

const router = express.Router();

// GET /api/public/courses/all?limit=10&page=1&search=keyword
router.get("/all", getPublicCoursesController)

// GET /api/public/courses/:courseId - Get course detail with syllabus (public view)
router.get("/:courseId", getPublicCourseDetailController)

export default router;