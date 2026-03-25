import axios from "axios";

const BACKEND_URL = "http://localhost:5001/api/public/products";

// Get public products with filters and pagination
export const getPublicProducts = async ({
    page = 1,
    limit = 12,
    search = "",
    minPrice = null,
    maxPrice = null,
    sortBy = "createdAt",
    sortOrder = "DESC"
} = {}) => {
    try {
        const params = { page, limit, search, sortBy, sortOrder };
        if (minPrice !== null) params.minPrice = minPrice;
        if (maxPrice !== null) params.maxPrice = maxPrice;

        const response = await axios.get(`${BACKEND_URL}/all`, { params });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch products";
        console.error("Get public products error:", message);
        throw new Error(message);
    }
};

// Get top products for landing page
export const getTopProducts = async (limit = 6) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/top`, {
            params: { limit }
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch top products";
        console.error("Get top products error:", message);
        throw new Error(message);
    }
};

// Get single product detail
export const getPublicProductDetail = async (productId) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/${productId}`);
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch product details";
        console.error("Get product detail error:", message);
        throw new Error(message);
    }
};
