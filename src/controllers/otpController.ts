import { Request, Response } from 'express';
import { verifyOTP } from '../services/otpService';
import { verifyUserEmail } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { resendOTP } from '../services/otpService';
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
        ApiResponse.internalServerError(res, 'Error verifying OTP');
    }
};

export const resendOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            ApiResponse.badRequest(res, 'Email is required');
            return;
        }

        await resendOTP(email);
        ApiResponse.success(res, 'OTP code has been resent to your email');
    } catch (error: any) {
        logger.error('Error in resendOTPController:', error);
        if (error.message === 'User not found') {
            ApiResponse.notFound(res, 'User not found');
        } else if (error.message === 'Email is already verified') {
            ApiResponse.badRequest(res, 'Email is already verified');
        } else {
            ApiResponse.internalServerError(res, 'Error resending OTP');
        }
    }
}; 