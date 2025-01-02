import { Request, Response } from 'express';
import { register, login, refreshTokens } from '../services/authService';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';
import { generateOTP } from '../services/otpService';

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
