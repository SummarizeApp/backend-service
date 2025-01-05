import { Request, Response } from 'express';
import { register, login, refreshTokens, forgotPassword, resetPassword } from '../services/authService';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';
import { generateOTP } from '../services/otpService';
import { verifyOTP } from '../services/otpService';
import { forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator';
import { User } from '../models/userModel';

export const registerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, username, connactNumber} = req.body;
        logger.info(`Register request for email: ${email}, username: ${username}`);

        const { userId } = await register(email, password, username, connactNumber);
        
        await generateOTP(userId, email);

        ApiResponse.success(res, 'Registration successful. Please check your email for verification code.', { userId }, 201);
    } catch (error: any) {
        logger.error('Error in registerController', error);
        ApiResponse.badRequest(res, error.message);
    }
};


export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        logger.info(`Login attempt for email: ${email}`);

        const result = await login(email, password);

        if ('requiresVerification' in result) {
            ApiResponse.success(
                res, 
                'Please verify your email address. A new verification code has been sent to your email.',
                { userId: result.userId, requiresVerification: true },
                200
            );
            return;
        }

        ApiResponse.success(res, 'Login successful', result);
    } catch (error: any) {
        logger.error('Error in loginController', error);
        ApiResponse.unauthorized(res, error.message);
    }
};

export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        logger.info('Refresh token request');

        const tokens = await refreshTokens(refreshToken);
        ApiResponse.success(res, 'Tokens refreshed successfully', tokens);
    } catch (error: any) {
        logger.error('Error in refreshTokenController', error);
        ApiResponse.unauthorized(res, error.message);
    }
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = forgotPasswordSchema.validate(req.body);
        if (error) {
            ApiResponse.badRequest(res, error.details[0].message);
            return;
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        
        if (!user) {
            ApiResponse.notFound(res, 'User not found');
            return;
        }

        await generateOTP(user._id.toString(), email);

        ApiResponse.success(
            res, 
            'OTP has been sent to your email for password reset verification.',
            { userId: user._id },
            200
        );
    } catch (error: any) {
        logger.error('Error in forgotPasswordController:', error);
        ApiResponse.badRequest(res, error.message);
    }
};

export const verifyResetOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, otpCode } = req.body;
        
        const isVerified = await verifyOTP(userId, otpCode);

        if (!isVerified) {
            ApiResponse.badRequest(res, 'Invalid or expired OTP');
            return;
        }

        const resetToken = await forgotPassword(userId);
        
        ApiResponse.success(res, 'OTP verified successfully', { resetToken });
    } catch (error: any) {
        logger.error('Error in verifyResetOTPController:', error);
        ApiResponse.badRequest(res, error.message);
    }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { resetToken } = req.params;
        const { newPassword, confirmPassword } = req.body;

        const { error } = resetPasswordSchema.validate({ 
            newPassword, 
            confirmPassword 
        });
        
        if (error) {
            ApiResponse.badRequest(res, error.details[0].message);
            return;
        }

        await resetPassword(resetToken, newPassword);

        ApiResponse.success(
            res, 
            'Password has been reset successfully. Please login with your new password.',
            null,
            200
        );
    } catch (error: any) {
        logger.error('Error in resetPasswordController:', error);
        ApiResponse.badRequest(res, error.message);
    }
};
