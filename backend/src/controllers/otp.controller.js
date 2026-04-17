import { createOTPRecord, verifyOTPRecord, markOTPAsVerified } from "../services/otp.service.js";
import { sendOTPEmail } from "../services/email.service.js";
import { registerUserService } from "../services/user.services.js";
import { registerTrainerServie } from "../services/user.services.js";
import http from "../http/response.js";
import user from "../models/usersModels.js";

// Send OTP for registration
export const sendOTP = async (req, res) => {
    try {
        const { email, registrationType } = req.body;

        if (!email || !registrationType) {
            return res.status(400).json({
                message: 'Email and registration type are required'
            });
        }

        if (!['user', 'trainer'].includes(registrationType)) {
            return res.status(400).json({
                message: 'Invalid registration type'
            });
        }

        // check email exists 
        const isEmailExist = await user.findOne({
            where:{
                email
            }
        })

        if(isEmailExist){
            return res.status(400).json({
                message:"Email already exists. Please use a different email or login."
            })
        }

        // Create OTP record with just email, registrationType (no tempData needed yet)
        const otpResult = await createOTPRecord(email, registrationType, { email });

        // Send OTP via email
        await sendOTPEmail(email, otpResult.otpCode);

        return res.status(200).json({
            message: 'OTP sent successfully',
            email: email,
            expiresIn: '10 minutes'
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({
            message: error.message || 'Failed to send OTP'
        });
    }
};

// Verify OTP (just verify, don't register yet)
export const verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({
                message: 'Email and OTP code are required'
            });
        }

        // Verify OTP
        const otpResult = await verifyOTPRecord(email, otpCode);

        return res.status(200).json({
            message: 'OTP verified successfully',
            email: email,
            registrationType: otpResult.registrationType
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(400).json({
            message: error.message || 'Failed to verify OTP'
        });
    }
};

// Complete registration for user (after OTP verification)
export const completeUserRegistration = async (req, res) => {
    try {
        const { email, otpCode, username, password, contact } = req.body;

        if (!email || !otpCode || !username || !password || !contact) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Verify OTP one more time to ensure it's valid
        const otpResult = await verifyOTPRecord(email, otpCode);

        if (otpResult.registrationType !== 'user') {
            return res.status(400).json({
                message: 'This OTP is for trainer registration'
            });
        }

        // Register user with details
        const result = await registerUserService(email, password, username, contact);

        // Mark OTP as verified after successful registration
        await markOTPAsVerified(email);

        return res.status(201).json({
            message: 'Registration successful',
            data: result.data
        });
    } catch (error) {
        console.error('Complete user registration error:', error);
        return res.status(400).json({
            message: error.message || 'Failed to complete registration'
        });
    }
};

// Complete registration for trainer (after OTP verification)
export const completeTrainerRegistration = async (req, res) => {
    try {
        const { email, otpCode, username, password, contact, specialization, type, latitude, longitude, radius } = req.body;
        const files = req.files;

        if (!email || !otpCode || !username || !password || !contact) {
            return res.status(400).json({
                message: 'All required fields must be provided'
            });
        }

        // Verify OTP one more time to ensure it's valid
        const otpResult = await verifyOTPRecord(email, otpCode);

        if (otpResult.registrationType !== 'trainer') {
            return res.status(400).json({
                message: 'This OTP is for user registration'
            });
        }

        // Register trainer with details
        const result = await registerTrainerServie(
            email,
            password,
            username,
            contact,
            specialization,
            type,
            latitude,
            longitude,
            radius,
            files
        );

        // Mark OTP as verified after successful registration
        await markOTPAsVerified(email);

        return res.status(201).json({
            message: 'Trainer registration successful',
            data: result.data
        });
    } catch (error) {
        console.error('Complete trainer registration error:', error);
        return res.status(400).json({
            message: error.message || 'Failed to complete trainer registration'
        });
    }
};
