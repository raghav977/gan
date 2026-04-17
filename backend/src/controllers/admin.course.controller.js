import { getAdminCoursesService } from "../services/admin.course.service.js";

export const getAdminCoursesController = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status = "" } = req.query;
        const data = await getAdminCoursesService({ page, limit, search, status });

        return res.status(200).json({
            message: "Courses fetched successfully",
            data
        });
    } catch (err) {
        console.error("Error fetching admin courses:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to fetch courses"
        });
    }
};
