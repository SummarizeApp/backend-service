import OTP from '../models/otpModel';
import crypto from 'crypto';
import logger from '../utils/logger';
import NotificationClient from './notificationClient';
import mongoose from 'mongoose';

const generateRandomOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

export const generateOTP = async (userId: string, email: string): Promise<void> => {
    try {
        const otpCode = generateRandomOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.create({
            userId,
            email,
            otpCode,
            expiresAt,
        });

        const notificationClient = NotificationClient.getInstance();
        await notificationClient.sendOTPEmail(email, otpCode);

    } catch (error) {
        logger.error('Error in generateOTP:', error);
        throw error;
    }
};

export const verifyOTP = async (userId: string, otpCode: string): Promise<boolean> => {
    try {
        const otpRecord = await OTP.findOne({ userId, otpCode });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return false;
        }

        await OTP.deleteOne({ _id: otpRecord._id });
        return true;
    } catch (error) {
        logger.error('Error verifying OTP:', error);
        throw error;
    }
};

export const resendOTP = async (userId: string | mongoose.Types.ObjectId, email: string): Promise<void> => {
    try {
        const existingOTPs = await OTP.find({ userId });
        if (existingOTPs.length > 0) {
            await OTP.deleteMany({ userId });
        }

        await generateOTP(userId.toString(), email);
        logger.info(`OTP resent to ${email}`);
    } catch (error) {
        logger.error('Error resending OTP:', error);
        throw error;
    }
}; 