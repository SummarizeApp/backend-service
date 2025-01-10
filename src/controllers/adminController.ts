import { Request, Response } from 'express';
import { User, UserRole } from '../models/userModel';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';
import { Case } from '../models/caseModel';
import axios from 'axios';

interface AIServiceResponse {
    summary: string;
    processingTime: number;
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().select('-password');
        ApiResponse.success(res, 'Users fetched successfully', users);
    } catch (error) {
        logger.error('Error in getAllUsers:', error);
        ApiResponse.internalServerError(res, 'Error fetching users');
    }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Kullanıcı istatistikleri
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const userCount = totalUsers - adminCount; // Admin olmayanlar normal kullanıcı
        const lastWeekUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Case istatistikleri
        const totalCases = await Case.countDocuments();
        const lastWeekCases = await Case.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Detaylı case istatistikleri
        const caseStats = await Case.aggregate([
            {
                $group: {
                    _id: null,
                    avgCompressionRatio: { $avg: '$stats.compressionRatio' },
                    maxCompressionRatio: { $max: '$stats.compressionRatio' },
                    avgProcessingTime: { $avg: '$stats.processingTime' },
                    totalOriginalLength: { $sum: '$stats.originalLength' },
                    totalSummaryLength: { $sum: '$stats.summaryLength' },
                    avgOriginalLength: { $avg: '$stats.originalLength' },
                    avgSummaryLength: { $avg: '$stats.summaryLength' }
                }
            }
        ]);

        // En aktif kullanıcılar (en çok case oluşturanlar)
        const topUsers = await Case.aggregate([
            {
                $group: {
                    _id: '$userId',
                    caseCount: { $sum: 1 }
                }
            },
            {
                $sort: { caseCount: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            }
        ]);

        const stats = {
            users: {
                total: totalUsers,
                admins: adminCount,
                regularUsers: userCount,
                newLastWeek: lastWeekUsers,
                topUsers: topUsers.map(u => ({
                    username: u.user[0]?.username || 'Silinmiş Kullanıcı',
                    caseCount: u.caseCount
                }))
            },
            cases: {
                total: totalCases,
                newLastWeek: lastWeekCases,
                avgCompressionRatio: caseStats[0]?.avgCompressionRatio || 0,
                maxCompressionRatio: caseStats[0]?.maxCompressionRatio || 0,
                avgProcessingTime: caseStats[0]?.avgProcessingTime || 0,
                totalTextLength: caseStats[0]?.totalOriginalLength || 0,
                totalSummaryLength: caseStats[0]?.totalSummaryLength || 0,
                avgOriginalLength: caseStats[0]?.avgOriginalLength || 0,
                avgSummaryLength: caseStats[0]?.avgSummaryLength || 0
            }
        };

        ApiResponse.success(res, 'Dashboard stats fetched successfully', stats);
    } catch (error) {
        logger.error('Error in getDashboardStats:', error);
        ApiResponse.internalServerError(res, 'Error fetching dashboard stats');
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        ApiResponse.success(res, 'User deleted successfully');
    } catch (error) {
        logger.error('Error in deleteUser:', error);
        ApiResponse.internalServerError(res, 'Error deleting user');
    }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!Object.values(UserRole).includes(role)) {
            ApiResponse.badRequest(res, 'Invalid role');
            return;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            ApiResponse.notFound(res, 'User not found');
            return;
        }

        ApiResponse.success(res, 'User role updated successfully', user);
    } catch (error) {
        logger.error('Error in updateUserRole:', error);
        ApiResponse.internalServerError(res, 'Error updating user role');
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { username, email, contactNumber, password, role } = req.body;

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (contactNumber) updateData.contactNumber = contactNumber;
        if (role) updateData.role = role;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            ApiResponse.notFound(res, 'User not found');
            return;
        }

        ApiResponse.success(res, 'User updated successfully', user);
    } catch (error) {
        logger.error('Error in updateUser:', error);
        ApiResponse.internalServerError(res, 'Error updating user');
    }
};