import OTP from '../models/otpModel';
import crypto from 'crypto';
import { emailService } from './emailService';
import logger from '../utils/logger';
import { User } from '../models/userModel';

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

export const resendOTP = async (email: string): Promise<void> => {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new Error('User not found');
        }

        if (user.isVerified) {
            throw new Error('Email is already verified');
        }

        await OTP.deleteMany({ userId: user._id });

        await generateOTP(user._id.toString(), email);
        
        logger.info(`OTP resent to ${email}`);
    } catch (error) {
        logger.error('Error resending OTP:', error);
        throw error;
    }
}; 