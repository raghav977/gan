import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
    getNotificationsController,
    markNotificationReadController,
    markAllNotificationsReadController
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotificationsController);
router.patch("/read-all", markAllNotificationsReadController);
router.patch("/:id/read", markNotificationReadController);

export default router;
