import { Request, Response } from 'express';
import { register, login, refreshTokens } from '../services/authService';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

export const registerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        Logger.info(`Register request for email: ${email}`);

        const tokens = await register(email, password);
        ApiResponse.success(res, 'User registered successfully', tokens, 201);
    } catch (error: any) {
        Logger.error('Error in registerController', error);
        ApiResponse.badRequest(res, error.message);
    }
};


export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        Logger.info(`Login attempt for email: ${email}`);

        const tokens = await login(email, password);
        ApiResponse.success(res, 'Login successful', tokens);
    } catch (error: any) {
        Logger.error('Error in loginController', error);
        ApiResponse.unauthorized(res, error.message);
    }
};

export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        Logger.info('Refresh token request');

        const tokens = await refreshTokens(refreshToken);
        ApiResponse.success(res, 'Tokens refreshed successfully', tokens);
    } catch (error: any) {
        Logger.error('Error in refreshTokenController', error);
        ApiResponse.unauthorized(res, error.message);
    }
};
