

import Trainer from "../models/TrainerModels.js";
import TrainerDocument from "../models/trainerdocument.model.js";
import { Op } from "sequelize";
import user from "../models/usersModels.js";

export const adminGetAllTrainer = async ({ status, search, page = 1, limit = 10 }) => {
    try {

        const offset = (page - 1) * limit;

        let trainerWhere = {};
        let userWhere = {};

        // Only add status filter if status is provided
        if (status) {
            if (status === "approved") {
                trainerWhere.is_verified = true;
            } else if (status === "pending") {
                trainerWhere.is_verified = false;
            }
        }
        // If no status, don't filter by is_verified (show all)

        if (search) {
            userWhere = {
                [Op.or]: [
                    { username: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { rows, count } = await Trainer.findAndCountAll({
            where: trainerWhere,
            include: [
                {
                    model: user,
                    attributes: ["id", "username", "email"],
                    where: userWhere,
                    required: search ? true : false
                }
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]]
        });

        return {
            trainers: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };

    } catch (err) {
        console.log("Something went wrong");
        throw err;
    }
};

// Get trainer details by ID (including documents)
export const getTrainerDetailService = async (trainerId) => {
    try {
        const trainer = await Trainer.findByPk(trainerId, {
            include: [
                {
                    model: user,
                    attributes: ["id", "username", "email", "contact", "createdAt"]
                },
                {
                    model: TrainerDocument,
                    attributes: ["id", "documentType", "documentURL", "createdAt"]
                }
            ]
        });

        if (!trainer) {
            throw new Error("Trainer not found");
        }

        return trainer;
    } catch (err) {
        console.log("Error getting trainer detail:", err.message);
        throw err;
    }
};

// Approve trainer
export const approveTrainerService = async (trainerId) => {
    try {
        const trainer = await Trainer.findByPk(trainerId);

        if (!trainer) {
            throw new Error("Trainer not found");
        }

        if (trainer.is_verified) {
            throw new Error("Trainer is already approved");
        }

        await trainer.update({ is_verified: true });

        return { message: "Trainer approved successfully", trainer };
    } catch (err) {
        console.log("Error approving trainer:", err.message);
        throw err;
    }
};

// Reject trainer (delete trainer and associated user)
export const rejectTrainerService = async (trainerId) => {
    try {
        const trainer = await Trainer.findByPk(trainerId, {
            include: [{ model: user }]
        });

        if (!trainer) {
            throw new Error("Trainer not found");
        }

        // Delete associated documents first
        await TrainerDocument.destroy({ where: { trainerId } });

        // Get user ID before deleting trainer
        const userId = trainer.userId;

        // Delete trainer
        await trainer.destroy();

        // Delete associated user account
        if (userId) {
            await user.destroy({ where: { id: userId } });
        }

        return { message: "Trainer rejected and removed successfully" };
    } catch (err) {
        console.log("Error rejecting trainer:", err.message);
        throw err;
    }
};