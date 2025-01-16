import { User } from '../models/userModel';
import { Case } from '../models/caseModel';
import logger from '../utils/logger';
import { S3Service } from './s3Service';
import RedisService from './redisService';

export const getUserProfile = async (userId: string) => {
    const user = await User.findById(userId)
        .select('-password')
        .populate('cases');
    
    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

export const updateUserStats = async (userId: string): Promise<void> => {
    try {
        const cases = await Case.find({ userId });
        
        const stats = cases.reduce((acc, curr) => {
            return {
                totalCases: acc.totalCases + 1,
                totalOriginalLength: acc.totalOriginalLength + (curr.stats?.originalLength || 0),
                totalSummaryLength: acc.totalSummaryLength + (curr.stats?.summaryLength || 0),
                totalCompressionRatio: acc.totalCompressionRatio + (curr.stats?.compressionRatio || 0)
            };
        }, {
            totalCases: 0,
            totalOriginalLength: 0,
            totalSummaryLength: 0,
            totalCompressionRatio: 0
        });

        const averageCompressionRatio = stats.totalCases > 0 
            ? stats.totalCompressionRatio / stats.totalCases 
            : 0;

        await User.findByIdAndUpdate(userId, {
            stats: {
                totalCases: stats.totalCases,
                totalOriginalLength: stats.totalOriginalLength,
                totalSummaryLength: stats.totalSummaryLength,
                averageCompressionRatio,
                lastUpdateDate: new Date()
            }
        });
    } catch (error) {
        logger.error('Error updating user stats:', error);
        throw error;
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    try {
        const cases = await Case.find({ userId });
        
        for (const caseDoc of cases) {
            const deletePromises = [];

            if (caseDoc.fileUrl) {
                deletePromises.push(S3Service.deleteFile(caseDoc.fileUrl));
            }

            if (caseDoc.summaryFileUrl) {
                deletePromises.push(S3Service.deleteFile(caseDoc.summaryFileUrl));
            }

            await Promise.all(deletePromises);
        }

        await Case.deleteMany({ userId });

        await User.findByIdAndDelete(userId);

        await RedisService.invalidateCaseCache(userId);
        await RedisService.invalidateProfileCache(userId);

        logger.info(`User ${userId} and all associated data deleted successfully`);
    } catch (error) {
        logger.error('Error in deleteUser:', error);
        throw error;
    }
};
