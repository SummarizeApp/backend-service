import OTP from '../models/otpModel';
import crypto from 'crypto';
import { emailService } from './emailService';
import logger from '../utils/logger';
import { IUser } from '../models/userModel';
import mongoose from 'mongoose';

export const generateOTP = async (userId: string, email: string): Promise<string> => {
    try {

        const otpCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.create({ userId, otpCode, expiresAt });

        await emailService.sendOTPEmail(email, otpCode);

        return otpCode;
    } catch (error) {
        logger.error('Error generating OTP:', error);
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

        const newOTP = await generateOTP(userId.toString(), email);
        if (!newOTP) {
            throw new Error('Failed to generate new OTP');
        }
        
        logger.info(`OTP resent to ${email}`);
    } catch (error) {
        logger.error('Error resending OTP:', error);
        throw error;
    }
}; 