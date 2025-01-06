import { User } from '../models/userModel';
import { Case } from '../models/caseModel';
import { uploadProfileImage, deleteProfileImage } from './s3Service';
import logger from '../utils/logger';

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

export const updateProfileImage = async (
    userId: string,
    file: Express.Multer.File
): Promise<string> => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const imageUrl = await uploadProfileImage(userId, file);

        if (user.profileImageUrl) {
            await deleteProfileImage(user.profileImageUrl);
        }

        user.profileImageUrl = imageUrl;
        await user.save();

        return imageUrl;
    } catch (error) {
        logger.error('Error updating profile image:', error);
        throw error;
    }
};

export const removeProfileImage = async (userId: string): Promise<void> => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.profileImageUrl) {
            await deleteProfileImage(user.profileImageUrl);
            user.profileImageUrl = null;
            await user.save();
        }
    } catch (error) {
        logger.error('Error removing profile image:', error);
        throw error;
    }
};
