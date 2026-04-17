import express from 'express';
import { sendOTP, verifyOTP, completeUserRegistration, completeTrainerRegistration } from '../controllers/otp.controller.js';
import { upload } from '../middlewares/multler.config.js';

const router = express.Router();

// Step 1: Send OTP for registration
router.post('/send-otp', sendOTP);

// Step 2: Verify OTP
router.post('/verify-otp', verifyOTP);

// Step 3: Complete user registration with details
router.post('/register-user', completeUserRegistration);

// Step 3: Complete trainer registration with details
router.post('/register-trainer', upload.array('certificate', 5), completeTrainerRegistration);

export default router;
