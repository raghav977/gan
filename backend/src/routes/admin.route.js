import express from "express"
import { adminSignUp } from "../controllers/admin.controller.js"

const router = express.Router()


router.post("/signup",adminSignUp)

// router.post("/")

export default router;