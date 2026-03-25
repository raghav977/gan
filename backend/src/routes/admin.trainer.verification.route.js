import express from "express"
import { 
    getAllTrainers, 
    getTrainerDetail, 
    approveTrainer, 
    rejectTrainer 
} from "../controllers/admin.trainer.verification.controller.js";


const router = express.Router()

// GET /api/admin/trainer/getall - Get all trainers with filters
router.get("/getall", getAllTrainers)

// GET /api/admin/trainer/:trainerId - Get trainer details
router.get("/:trainerId", getTrainerDetail)

// PUT /api/admin/trainer/:trainerId/approve - Approve trainer
router.put("/:trainerId/approve", approveTrainer)

// DELETE /api/admin/trainer/:trainerId/reject - Reject trainer
router.delete("/:trainerId/reject", rejectTrainer)

export default router;