
import express from "express";
import { registerTrainer } from "../controllers/Trainer.controller.js";
import { upload } from "../middlewares/multler.config.js";


const router = express.Router();


router.post(
    "/register",
    upload.array("certificate", 5),

    registerTrainer

);


export default router;
