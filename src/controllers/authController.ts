import { Request, Response } from 'express';
import { register, login } from '../services/authService';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

export const registerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        Logger.info(`Register request for email: ${email}`);

        const user = await register(email, password);
        ApiResponse.success(res, 'User registered successfully', { id: user._id, email: user.email }, 201);
    } catch (error: any) {
        Logger.error('Error in registerController', error);
        ApiResponse.badRequest(res, error.message);
    }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        Logger.info(`Login attempt for email: ${email}`);

        const token = await login(email, password);
        ApiResponse.success(res, 'Login successful', { token });
    } catch (error: any) {
        Logger.error('Error in loginController', error);
        ApiResponse.unauthorized(res, error.message);
    }
};
