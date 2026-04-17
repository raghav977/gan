import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Your OTP for Registration',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f7c707; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #333; margin: 0;">VIS</h1>
                    </div
                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
                        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                            Thank you for registering with VIS. Please verify your email address using the OTP below:
                        </p>
                        <div style="background-color: #fff; border: 2px solid #f7c707; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <h3 style="color: #f7c707; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h3>
                        </div>
                        <p style="color: #666; font-size: 14px; margin: 20px 0;">
                            This OTP is valid for 10 minutes.
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            If you didn't request this, please ignore this email.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send OTP email');
    }
};

export const sendRegistrationConfirmation = async (email, username) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Registration Successful - VIS',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f7c707; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #333; margin: 0;">VIS</h1>
                    </div>
                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${username}!</h2>
                        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                            Your registration has been completed successfully. You can now log in to your account.
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Happy Learning!
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Confirmation email sent' };
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send confirmation email');
    }
};
