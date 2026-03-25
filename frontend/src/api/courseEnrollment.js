import axios from "axios";

const BACKEND_URL = 'http://localhost:5001/api/enrollment';

// Get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Enroll in a course
export const enrollInCourse = async (courseId) => {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/enroll/${courseId}`,
            {},
            getAuthHeader()
        );
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to enroll in course";
        throw new Error(message);
    }
};

// Check enrollment status for a course
export const checkCourseEnrollment = async (courseId) => {
    try {
        const response = await axios.get(
            `${BACKEND_URL}/check/${courseId}`,
            getAuthHeader()
        );
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to check enrollment";
        throw new Error(message);
    }
};

// Get user's enrolled courses (My Courses)
export const getMyCourses = async (status = null) => {
    try {
        const params = status ? { status } : {};
        const response = await axios.get(
            `${BACKEND_URL}/my-courses`,
            {
                ...getAuthHeader(),
                params
            }
        );
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch courses";
        throw new Error(message);
    }
};

// Get enrolled course detail with full content
export const getEnrolledCourseDetail = async (courseId) => {
    try {
        const response = await axios.get(
            `${BACKEND_URL}/course/${courseId}`,
            getAuthHeader()
        );
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch course";
        throw new Error(message);
    }
};

// Get specific lecture content
export const getLectureContent = async (courseId, lectureId) => {
    try {
        const response = await axios.get(
            `${BACKEND_URL}/course/${courseId}/lecture/${lectureId}`,
            getAuthHeader()
        );
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch lecture";
        throw new Error(message);
    }
};

// Update lecture progress (mark complete/incomplete)
export const updateLectureProgress = async (courseId, lectureId, isCompleted = true) => {
    try {
        const response = await axios.put(
            `${BACKEND_URL}/course/${courseId}/lecture/${lectureId}/progress`,
            { isCompleted },
            getAuthHeader()
        );
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to update progress";
        throw new Error(message);
    }
};
