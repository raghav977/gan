import express from "express";
import { getApprovedTrainerListController } from "../controllers/public.trainerlist.controller.js";


const router = express.Router();


router.get("/approvedTrainer",getApprovedTrainerListController );

export default router;
