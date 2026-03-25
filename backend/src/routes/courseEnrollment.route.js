import express from 'express';
import {
    enrollInCourse,
    checkEnrollment,
    getMyCoursesController,
    getEnrolledCourseDetail,
    updateProgress,
    getLectureContent
} from '../controllers/courseEnrollment.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's enrolled courses (My Courses)
router.get('/my-courses', getMyCoursesController);

// Check enrollment status for a course
router.get('/check/:courseId', checkEnrollment);

// Enroll in a course
router.post('/enroll/:courseId', enrollInCourse);

// Get enrolled course detail with full content
router.get('/course/:courseId', getEnrolledCourseDetail);

// Get specific lecture content
router.get('/course/:courseId/lecture/:lectureId', getLectureContent);

// Update lecture progress (mark as complete)
router.put('/course/:courseId/lecture/:lectureId/progress', updateProgress);

export default router;
