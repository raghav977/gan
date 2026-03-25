import express from "express"
import { uploadVideo } from "../middlewares/video.upload.js";
import { uploadResourceController, uploadVideoController } from "../controllers/course.controller.js";
import { authMiddleware, trainerAuthMiddleware } from "../middlewares/auth.js";
import { uploadLectureResource } from "../middlewares/resource.upload.js";



const router = express.Router();

router.post("/upload/:lectureId/video",authMiddleware,trainerAuthMiddleware,uploadVideo.single("video"),uploadVideoController);

router.post("/upload/:lectureId/resource",authMiddleware,trainerAuthMiddleware,uploadLectureResource.single("resource"),uploadResourceController);


export default router;