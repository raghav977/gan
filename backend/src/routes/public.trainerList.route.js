import express from "express";
import { getApprovedTrainerListController, getTrainerDetailController } from "../controllers/public.trainerlist.controller.js";


const router = express.Router();


router.get("/approvedTrainer", getApprovedTrainerListController);
router.get("/detail/:trainerId", getTrainerDetailController);

export default router;
