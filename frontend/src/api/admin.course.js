import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const ADMIN_COURSE_URL = `${BASE_URL}/api/admin/courses`;

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAdminCourses = async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
    try {
        const params = { page, limit };
        if (search) params.search = search;
        if (status) params.status = status;

        const response = await axios.get(ADMIN_COURSE_URL, {
            params,
            headers: getAuthHeader()
        });

        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch courses";
        console.error("Get admin courses error:", message);
        throw new Error(message);
    }
};
