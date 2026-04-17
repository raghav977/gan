import axios from 'axios';

const API = axios.create({
    baseURL: "http://localhost:5001/api",
});

// Step 1: Send OTP
export const sendOTP = async (email, registrationType) => {
    try {
        const { data } = await API.post('/auth/send-otp', {
            email,
            registrationType
        });
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to send OTP';
        throw new Error(message);
    }
};

// Step 2: Verify OTP
export const verifyOTP = async (email, otpCode) => {
    try {
        const { data } = await API.post('/auth/verify-otp', {
            email,
            otpCode
        });
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to verify OTP';
        throw new Error(message);
    }
};

// Step 3: Complete user registration with all details
export const completeUserRegistration = async (email, otpCode, username, password, contact) => {
    try {
        const { data } = await API.post('/auth/register-user', {
            email,
            otpCode,
            username,
            password,
            contact
        });
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to complete registration';
        throw new Error(message);
    }
};

// Step 3: Complete trainer registration with all details
export const completeTrainerRegistration = async (email, otpCode, formData) => {
    try {
        const { data } = await API.post('/auth/register-trainer', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to complete trainer registration';
        throw new Error(message);
    }
};
