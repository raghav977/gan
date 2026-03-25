import { 
    adminGetAllTrainer, 
    getTrainerDetailService, 
    approveTrainerService, 
    rejectTrainerService 
} from "../services/admin.verification.service.js";


export const getAllTrainers = async (req, res) => {
    try {
        const { status, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Pass as object to match service function signature
        const data = await adminGetAllTrainer({ status, search, page, limit });
        console.log("This is data", data);

        return res.status(200).json({
            success: true,
            data: data.trainers,
            total: data.total,
            totalPages: data.totalPages,
            currentPage: data.currentPage
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// Get trainer details
export const getTrainerDetail = async (req, res) => {
    try {
        const { trainerId } = req.params;

        if (!trainerId) {
            return res.status(400).json({
                success: false,
                message: "Trainer ID is required"
            });
        }

        const trainer = await getTrainerDetailService(trainerId);

        return res.status(200).json({
            success: true,
            data: trainer
        });

    } catch (err) {
        console.log(err);
        return res.status(404).json({
            success: false,
            message: err.message || "Trainer not found"
        });
    }
};

// Approve trainer
export const approveTrainer = async (req, res) => {
    try {
        const { trainerId } = req.params;

        if (!trainerId) {
            return res.status(400).json({
                success: false,
                message: "Trainer ID is required"
            });
        }

        const result = await approveTrainerService(trainerId);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.trainer
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to approve trainer"
        });
    }
};

// Reject trainer
export const rejectTrainer = async (req, res) => {
    try {
        const { trainerId } = req.params;

        if (!trainerId) {
            return res.status(400).json({
                success: false,
                message: "Trainer ID is required"
            });
        }

        const result = await rejectTrainerService(trainerId);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to reject trainer"
        });
    }
};