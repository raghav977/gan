import OTP from "../models/otp.model.js";
import { Op } from "sequelize";

// Generate random 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create or update OTP record
export const createOTPRecord = async (email, registrationType, tempData = null) => {
    try {
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete existing OTP for this email
        await OTP.destroy({ where: { email } });

        // Create new OTP
        const otp = await OTP.create({
            email,
            otpCode,
            isVerified: false,
            expiresAt,
            registrationType,
            tempData
        });

        return {
            success: true,
            otpCode,
            expiresAt
        };
    } catch (error) {
        console.error('OTP creation error:', error);
        throw new Error('Failed to create OTP');
    }
};

// Verify OTP (check if valid, but don't mark as verified yet)
export const verifyOTPRecord = async (email, otpCode) => {
    try {
        const otp = await OTP.findOne({ where: { email } });

        if (!otp) {
            throw new Error('OTP not found');
        }

        if (new Date() > otp.expiresAt) {
            throw new Error('OTP has expired');
        }

        if (otp.attemptCount >= 5) {
            throw new Error('Too many failed attempts. Request a new OTP');
        }

        if (otp.otpCode !== otpCode) {
            await otp.increment('attemptCount');
            throw new Error('Invalid OTP');
        }

        return {
            success: true,
            tempData: otp.tempData,
            registrationType: otp.registrationType,
            email: otp.email
        };
    } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
    }
};

// Mark OTP as verified (call this after successful registration)
export const markOTPAsVerified = async (email) => {
    try {
        const otp = await OTP.findOne({ where: { email } });
        if (otp) {
            otp.isVerified = true;
            await otp.save();
        }
    } catch (error) {
        console.error('Error marking OTP as verified:', error);
    }
};

// Get OTP record
export const getOTPRecord = async (email) => {
    try {
        const otp = await OTP.findOne({ where: { email } });
        return otp;
    } catch (error) {
        console.error('Error fetching OTP:', error);
        throw error;
    }
};

// Clean up expired OTPs
export const cleanupExpiredOTPs = async () => {
    try {
        await OTP.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        });
    } catch (error) {
        console.error('Error cleaning up expired OTPs:', error);
    }
};
