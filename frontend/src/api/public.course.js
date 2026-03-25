import axios from "axios"

const BACKEND_URL = 'http://localhost:5001/api/public/courses'

// Get public courses with pagination and search
// For landing page: getPublicCourses({ limit: 5 })
// For courses page: getPublicCourses({ limit: 10, page: 1, search: "keyword" })
export const getPublicCourses = async({ limit = 10, page = 1, search = "" } = {}) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/all`, {
            params: { limit, page, search }
        });
        return response.data;
    } catch(err) {
        const message = err.response?.data?.message || "Failed to fetch courses";
        console.error("Get public courses error:", message);
        throw new Error(message);
    }
}

// Convenience function for landing page (top 5 courses)
export const getTopPublicCourses = async() => {
    return getPublicCourses({ limit: 5, page: 1, search: "" });
}

// Get public course detail with syllabus (titles only, no video/resource URLs)
export const getPublicCourseDetail = async(courseId) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/${courseId}`);
        return response.data;
    } catch(err) {
        const message = err.response?.data?.message || "Failed to fetch course details";
        console.error("Get public course detail error:", message);
        throw new Error(message);
    }
}