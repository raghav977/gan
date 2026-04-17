import express from "express"
import { adminSignUp, getAdminProfile, updateAdminProfile } from "../controllers/admin.controller.js"
import { authMiddleware, adminAuthMiddleware } from "../middlewares/auth.js";

const router = express.Router()


router.post("/signup",adminSignUp)

router.get("/profile", authMiddleware, adminAuthMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, adminAuthMiddleware, updateAdminProfile);

// router.post("/")

export default router;