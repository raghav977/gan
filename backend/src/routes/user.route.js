
import express from "express";
import {loginUser, registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multler.config.js";
 

const router = express.Router(); 

router.post("/register", registerUser);
router.post(
    "/trainer-register",
    upload.fields([
        { name: "certificate1", maxCount: 1 },
        { name: "certificate2", maxCount: 1 }
    ]),
    (req, res) => {
        res.json({
            body: req.body,
            files: req.files
        });
    }
);

router.post("/login",loginUser)


export default router;
