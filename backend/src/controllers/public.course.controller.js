import { TrainerCourse } from "../models/trainerCourse.js";
import Trainer from "../models/TrainerModels.js";
import { getPublicCoursesServices, getPublicCourseDetailService } from "../services/public.course.service.js";

// Get public courses with pagination and search
// Used for both landing page (limit=5) and courses page (limit=10+)
export const getPublicCoursesController = async(req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";

        
        const result = await getPublicCoursesServices(limit, page, search);

        console.log("This is result",result);
        return res.status(200).json({
            message: "Courses fetched successfully",
            data: result.courses,
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage
        });
    } catch(err) {
        console.error("Error fetching public courses:", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}


// Get public course detail with syllabus (titles only, no video/resource URLs)
export const getPublicCourseDetailController = async(req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);

        if (!courseId) {
            return res.status(400).json({
                message: "Course ID is required"
            });
        }

        const courseDetail = await getPublicCourseDetailService(courseId);

        return res.status(200).json({
            message: "Course detail fetched successfully",
            data: courseDetail
        });

    } catch(err) {
        console.error("Error fetching course detail:", err.message);
        return res.status(404).json({
            message: err.message || "Course not found"
        });
    }
}