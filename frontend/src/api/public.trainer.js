import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001/api",
});



export const getAllApprovedTrainer = async ({ page = 1, limit = 10, search = ""}) => {
    try {
        const { data } = await API.get("/public/trainer/approvedTrainer", {
            params: { page, limit, search },
        });

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message || "Failed to fetch trainers";

        throw new Error(message);
    }
};

export const getTrainerDetail = async (trainerId) => {
    try {
        const { data } = await API.get(`/public/trainer/detail/${trainerId}`);
        return data;
    } catch (error) {
        const message =
            error.response?.data?.message || "Failed to fetch trainer details";
        throw new Error(message);
    }
};

