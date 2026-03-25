import express from 'express';
import { upload } from '../middlewares/multler.config.js';
import { 
    createCourse, 
    createLectureController, 
    createWeekController,
    getCoursesController,
    getCourseDetailController,
    updateCourseStatusController,
    updateWeekController,
    deleteWeekController,
    updateLectureController,
    deleteLectureController,
    reorderWeeksController,
    reorderLecturesController
} from '../controllers/course.controller.js';
import { authMiddleware, trainerAuthMiddleware } from '../middlewares/auth.js';

const router = express.Router();


// adding middleware baki xa.

// Course routes
router.post("/create",authMiddleware,trainerAuthMiddleware,upload.single("courseImage"),createCourse)
router.get("/all",authMiddleware,trainerAuthMiddleware,getCoursesController);
router.get("/:courseId",authMiddleware,trainerAuthMiddleware,getCourseDetailController);
router.put("/:courseId/status",authMiddleware,trainerAuthMiddleware,updateCourseStatusController);

// Week routes
router.post("/:courseId/weeks",authMiddleware,trainerAuthMiddleware,createWeekController);
router.put("/weeks/:weekId",authMiddleware,trainerAuthMiddleware,updateWeekController);
router.delete("/weeks/:weekId",authMiddleware,trainerAuthMiddleware,deleteWeekController);
router.put("/:courseId/weeks/reorder",authMiddleware,trainerAuthMiddleware,reorderWeeksController);

// Lecture routes
router.post("/weeks/:weekId/lectures",authMiddleware,trainerAuthMiddleware,createLectureController);
router.put("/lectures/:lectureId",authMiddleware,trainerAuthMiddleware,updateLectureController);
router.delete("/lectures/:lectureId",authMiddleware,trainerAuthMiddleware,deleteLectureController);
router.put("/weeks/:weekId/lectures/reorder",authMiddleware,trainerAuthMiddleware,reorderLecturesController);


export default router;