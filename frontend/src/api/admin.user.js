import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getAllTrainers = async ({ page = 1, limit = 10, search = "", status = "" }) => {
    try {
        const { data } = await API.get("/admin/trainer/getall", {
            params: { page, limit, search, status },
        });

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message || "Failed to fetch trainers";

        throw new Error(message);
    }
};

// Get trainer details
export const getTrainerDetail = async (trainerId) => {
    try {
        const { data } = await API.get(`/admin/trainer/${trainerId}`);
        return data;
    } catch (error) {
        const message =
            error.response?.data?.message || "Failed to fetch trainer details";
        throw new Error(message);
    }
};

// Approve trainer
export const approveTrainer = async (trainerId) => {
    try {
        const { data } = await API.put(`/admin/trainer/${trainerId}/approve`);
        return data;
    } catch (error) {
        const message =
            error.response?.data?.message || "Failed to approve trainer";
        throw new Error(message);
    }
};

// Reject trainer
export const rejectTrainer = async (trainerId) => {
    try {
        const { data } = await API.delete(`/admin/trainer/${trainerId}/reject`);
        return data;
    } catch (error) {
        const message =
            error.response?.data?.message || "Failed to reject trainer";
        throw new Error(message);
    }
};

// Keep for backward compatibility
export const getAllUsers = getAllTrainers;

export const getAdminProfile = async () => {
    try {
        const { data } = await API.get("/admin/profile");
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to fetch admin profile";
        throw new Error(message);
    }
};

export const updateAdminProfile = async (payload) => {
    try {
        const { data } = await API.put("/admin/profile", payload);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to update admin profile";
        throw new Error(message);
    }
};