import { Request, Response } from 'express';
import { getUserProfile } from '../services/userService';
import { ApiResponse } from '../utils/apiResponse';
import { JwtPayload } from 'jsonwebtoken';
import logger from '../utils/logger';

interface AuthRequest extends Request {
    user?: string | JwtPayload; 
}

export const getUserProfileController = async (req: AuthRequest, res: Response): Promise<void> =>{
    try {
        const userId = typeof req.user === 'string' ? req.user : req.user?.id;
        if (!userId) {
            ApiResponse.error(res, 'Unauthorized', 401);
        }

        const userProfile = await getUserProfile(userId);
        ApiResponse.success(res, 'User profile fetched successfully', { user: userProfile });
    } catch (error: any) {
        logger.error('Error in createCaseWithFileController', error);
        ApiResponse.internalServerError(res, 'Error creating case and uploading file');
    }
};
