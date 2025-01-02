import nodemailer from 'nodemailer';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

class EmailService {
    async sendOTPEmail(email: string, otpCode: string): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your OTP Code',
                html: `
                    <h1>Email Verification</h1>
                    <p>Your OTP code is: <strong>${otpCode}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                `,
            };

            await transporter.sendMail(mailOptions);
            logger.info(`OTP email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending OTP email:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(email: string, username: string): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to Our Platform',
                html: `
                    <h1>Welcome ${username}!</h1>
                    <p>Thank you for joining our platform.</p>
                    <p>We're excited to have you on board!</p>
                `,
            };

            await transporter.sendMail(mailOptions);
            logger.info(`Welcome email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending welcome email:', error);
            throw error;
        }
    }
}

export const emailService = new EmailService();