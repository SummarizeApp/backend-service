import { Request, Response } from 'express';
import { getUserProfile, updateUserStats } from '../services/userService';
import { ApiResponse } from '../utils/apiResponse';
import { JwtPayload } from 'jsonwebtoken';
import logger from '../utils/logger';
import RedisService from '../services/redisService';

interface AuthRequest extends Request {
    user?: string | JwtPayload;
    file?: Express.Multer.File;
}

export const getUserProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = typeof req.user === 'string' ? req.user : req.user?.id;
        if (!userId) {
            ApiResponse.unauthorized(res, 'User not authenticated');
            return;
        }

        const cachedProfile = await RedisService.getCachedProfile(userId);
        if (cachedProfile) {
            logger.info('Profile retrieved from cache');
            ApiResponse.success(res, 'User profile fetched from cache', { 
                user: JSON.parse(cachedProfile) 
            });
            return;
        }

        const userProfile = await getUserProfile(userId);
        await RedisService.setCachedProfile(userId, userProfile);

        ApiResponse.success(res, 'User profile fetched successfully', { user: userProfile });
    } catch (error: any) {
        logger.error('Error in getUserProfileController:', error);
        ApiResponse.internalServerError(res, 'Error fetching user profile');
    }
};

export const updateUserStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = typeof req.user === 'string' ? req.user : req.user?.id;
        if (!userId) {
            ApiResponse.unauthorized(res, 'User not authenticated');
            return;
        }

        await updateUserStats(userId);
        const updatedProfile = await getUserProfile(userId);
        await RedisService.setCachedProfile(userId, updatedProfile);

        ApiResponse.success(res, 'User stats updated successfully', { user: updatedProfile });
    } catch (error: any) {
        logger.error('Error in updateUserStatsController:', error);
        ApiResponse.internalServerError(res, 'Error updating user stats');
    }
};