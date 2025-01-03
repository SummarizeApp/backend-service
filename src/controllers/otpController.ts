import { Request, Response } from 'express';
import { verifyOTP, generateOTP, resendOTP } from '../services/otpService';
import { verifyUserEmail } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { User } from '../models/userModel';
import logger from '../utils/logger';

export const verifyOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, otpCode } = req.body;
        const isVerified = await verifyOTP(userId, otpCode);

        if (!isVerified) {
            ApiResponse.badRequest(res, 'Invalid or expired OTP');
            return;
        }

        const tokens = await verifyUserEmail(userId);
        ApiResponse.success(res, 'Email verified successfully', tokens);
    } catch (error: any) {
        logger.error('Error in verifyOTPController:', error);
        ApiResponse.internalServerError(res, 'Error verifying OTP');
    }
};

export const resendOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;

        if (!userId) {
            ApiResponse.badRequest(res, 'User ID is required');
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            ApiResponse.notFound(res, 'User not found');
            return;
        }

        if (user.isVerified) {
            ApiResponse.badRequest(res, 'Email is already verified');
            return;
        }


        await resendOTP(user._id, user.email);
        
        ApiResponse.success(res, 'OTP code has been resent to your email');
    } catch (error: any) {
        logger.error('Error in resendOTPController:', error);
        ApiResponse.internalServerError(res, 'Error resending OTP');
    }
}; 