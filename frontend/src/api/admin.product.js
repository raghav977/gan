import axios from "axios";

const BACKEND_URL = "http://localhost:5001/api/admin/products";

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new product
export const createProduct = async (formData) => {
    try {
        const response = await axios.post(BACKEND_URL, formData, {
            headers: {
                ...getAuthHeader(),
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to create product";
        console.error("Create product error:", message);
        throw new Error(message);
    }
};

// Get all products with pagination
export const getAllProducts = async ({ page = 1, limit = 10, search = "" } = {}) => {
    try {
        const response = await axios.get(BACKEND_URL, {
            params: { page, limit, search },
            headers: getAuthHeader()
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch products";
        console.error("Get products error:", message);
        throw new Error(message);
    }
};

// Get single product by ID
export const getProductById = async (productId) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/${productId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch product";
        console.error("Get product error:", message);
        throw new Error(message);
    }
};

// Update product
export const updateProduct = async (productId, formData) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/${productId}`, formData, {
            headers: {
                ...getAuthHeader(),
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to update product";
        console.error("Update product error:", message);
        throw new Error(message);
    }
};

// Delete product
export const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/${productId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to delete product";
        console.error("Delete product error:", message);
        throw new Error(message);
    }
};

export const getOrderedProducts = async ({ page = 1, limit = 10, status = "PURCHASED", search = "" } = {}) => {
    try {
        const params = { page, limit };
        if (status) params.status = status;
        if (search) params.search = search;

        const response = await axios.get(`${BACKEND_URL}/orders`, {
            params,
            headers: getAuthHeader()
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch ordered products";
        console.error("Get ordered products error:", message);
        throw new Error(message);
    }
};
