import { generateRandomCode } from '../utils/helpers';
import NotificationClient from './notificationClient';
import RedisService from './redisService';
import logger from '../utils/logger';

const redis = RedisService.getInstance();
const OTP_EXPIRY = 300; // 5 minutes in seconds

export const generateOTP = async (userId: string, email: string): Promise<void> => {
    try {
        const otpCode = generateRandomCode();
        
        await redis.setex(`otp:${userId}`, OTP_EXPIRY, otpCode);
        
        const notificationClient = NotificationClient.getInstance();
        await notificationClient.sendOTPEmail(email, otpCode);

        logger.info(`OTP generated and sent to ${email}`);
    } catch (error) {
        logger.error('Error in generateOTP:', error);
        throw new Error('Failed to generate and send OTP');
    }
};

export const verifyOTP = async (userId: string, otpCode: string): Promise<boolean> => {
    try {
        // Redis'ten OTP'yi al
        const storedOTP = await redis.get(`otp:${userId}`);
        
        if (!storedOTP) {
            return false; // OTP expired or doesn't exist
        }

        const isValid = storedOTP === otpCode;

        if (isValid) {
            // Doğrulama başarılı olduğunda OTP'yi sil
            await redis.del(`otp:${userId}`);
        }

        return isValid;
    } catch (error) {
        logger.error('Error in verifyOTP:', error);
        throw new Error('Failed to verify OTP');
    }
};

export const resendOTP = async (userId: string, email: string): Promise<void> => {
    try {

        const key = `otp:${userId}`;
        const deleted = await redis.del(key);
        
        if (deleted === 0) {
            logger.warn(`No existing OTP found for userId: ${userId}`);
        } else {
            logger.info(`Existing OTP deleted for userId: ${userId}`);
        }

        // Yeni OTP oluştur ve gönder
        await generateOTP(userId, email);
        
        logger.info(`New OTP generated and sent for userId: ${userId}`);
    } catch (error) {
        logger.error('Error in resendOTP:', error);
        throw new Error('Failed to resend OTP');
    }
}; 