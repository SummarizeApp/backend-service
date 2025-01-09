import { Case, ICase } from '../models/caseModel';
import { User } from '../models/userModel';
import logger from '../utils/logger';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import { updateUserStats } from './userService';
import RedisService from './redisService';
import { PDFService } from './pdfService';
import { S3Service } from './s3Service'; 

// CRUD İşlemleri
export const createCaseWithFile = async (
    userId: string, 
    title: string, 
    description: string, 
    file: Express.Multer.File
): Promise<HydratedDocument<ICase>> => {
    try {
        const fileUrl = await S3Service.uploadFile(userId, Date.now().toString(), file);

        const cleanedText = await PDFService.parsePdf(file.buffer);


        const newCase = await Case.create({
            userId,
            title,
            description,
            fileUrl: fileUrl,
            textContent: cleanedText
        });

        await User.findByIdAndUpdate(userId, {
            $push: { cases: newCase._id },
        });

        await RedisService.invalidateCaseCache(userId);
        
        return newCase;
    } catch (error) {
        logger.error('Error in createCaseWithFile:', error);
        throw error;
    }
};

export const getCasesByUserId = async (userId: string) => {
    try {
        const cachedCases = await RedisService.getCachedCases(userId);
        if (cachedCases) {
            logger.info('Cases fetched from cache');
            return JSON.parse(cachedCases);
        }

        const cases = await Case.find({ userId })
            .select('-textContent')
            .sort({ createdAt: -1 });

        await RedisService.setCachedCases(userId, cases);
        
        logger.info('Cases fetched from database and cached');
        return cases;
    } catch (error) {
        logger.error('Error in getCasesByUserId:', error);
        throw error;
    }
};

export const getCases = async (userId: string) => {
    return await Case.find({ userId })
        .select('+textContent +summary +fileUrl +summaryFileUrl')
        .sort({ createdAt: -1 });
};

export const deleteCases = async (caseIds: string[], userId: string): Promise<{ 
    success: string[], 
    failed: string[] 
}> => {
    try {
        const results = {
            success: [] as string[],
            failed: [] as string[]
        };

        for (const caseId of caseIds) {
            try {
                const caseToDelete = await Case.findOne({ _id: caseId, userId });
                
                if (!caseToDelete) {
                    results.failed.push(caseId);
                    continue;
                }

                const deletePromises = [];

                if (caseToDelete.fileUrl) {
                    deletePromises.push(S3Service.deleteFile(caseToDelete.fileUrl));
                }

                if (caseToDelete.summaryFileUrl) {
                    deletePromises.push(S3Service.deleteFile(caseToDelete.summaryFileUrl));
                }

                await Promise.all(deletePromises);

                await User.findByIdAndUpdate(caseToDelete.userId, {
                    $pull: { cases: caseId }
                });

                await Case.findByIdAndDelete(caseId);
                results.success.push(caseId);
            } catch (error) {
                logger.error(`Error deleting case ${caseId}:`, error);
                results.failed.push(caseId);
            }
        }

        await RedisService.invalidateCaseCache(userId);

        return results;
    } catch (error) {
        logger.error('Error in deleteCases:', error);
        throw error;
    }
};

// Dosya İşlemleri
export const saveSummaryWithPDF = async (caseId: string, summary: string): Promise<void> => {
    try {
        const startTime = Date.now();
        const caseDoc = await Case.findById(caseId);
        
        if (!caseDoc) {
            throw new Error('Case not found');
        }

        const originalLength = caseDoc.textContent?.length || 0;
        const summaryLength = summary.length;
        const processingTime = Date.now() - startTime;
        const compressionRatio = originalLength > 0 ? ((originalLength - summaryLength) / originalLength) * 100 : 0;

        // PDF özet dosyası PDFService ile oluşturuluyor
        const pdfBuffer = await PDFService.createSummaryPDF(summary);
        const summaryFileUrl = await S3Service.uploadSummary(pdfBuffer, caseId);

        await Case.findByIdAndUpdate(caseId, {
            summary,
            summaryFileUrl,
            stats: {
                originalLength,
                summaryLength,
                compressionRatio,
                processingTime,
                createdAt: new Date()
            }
        });

        await updateUserStats(caseDoc.userId.toString());
    } catch (error) {
        logger.error('Error in saveSummaryWithPDF:', error);
        throw error;
    }
};

// İstatistiksel İşlemler
export const getCaseStats = async (userId: string) => {
    const stats = await Case.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalCases: { $sum: 1 },
                averageCompressionRatio: { $avg: '$stats.compressionRatio' },
                averageProcessingTime: { $avg: '$stats.processingTime' },
                totalOriginalLength: { $sum: '$stats.originalLength' },
                totalSummaryLength: { $sum: '$stats.summaryLength' }
            }
        }
    ]);

    const monthlyStats = await Case.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                casesCount: { $sum: 1 },
                averageCompressionRatio: { $avg: '$stats.compressionRatio' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
    ]);

    return {
        overall: stats[0] || {
            totalCases: 0,
            averageCompressionRatio: 0,
            averageProcessingTime: 0,
            totalOriginalLength: 0,
            totalSummaryLength: 0
        },
        monthly: monthlyStats
    };
};