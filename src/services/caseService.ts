import { Case, ICase } from '../models/caseModel';
import { User } from '../models/userModel';
import logger from '../utils/logger';
import s3 from '../config/awsConfig';
import pdfParse from 'pdf-parse';
import PDFDocument from 'pdfkit';
import { HydratedDocument } from 'mongoose';
import path from 'path';
import mongoose from 'mongoose';
import { updateUserStats } from './userService';

export const uploadFileToS3 = async (userId: string, caseId: string, file: Express.Multer.File): Promise<string> => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
        Key: `cases/${userId}/${caseId}/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, async (err: any, data: any) => {
            if (err) {
                logger.error('Error uploading file to S3', err);
                reject('Error uploading file');
            } else {
                resolve(data.Location);
            }
        });
    });
};

export const createCaseWithFile = async (
    userId: string, 
    title: string, 
    description: string, 
    file: Express.Multer.File
): Promise<HydratedDocument<ICase>> => {
    const fileUrl = await uploadFileToS3(userId, Date.now().toString(), file);
    
    const pdfData = await pdfParse(file.buffer);
    const cleanedText = cleanPdfText(pdfData.text);

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

    return newCase;
};

export const getFileFromS3 = async (caseId: string, fileName: string): Promise<any> => {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
        throw new Error('Case not found');
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
        Key: caseDoc.fileUrl 
    };

    return s3.getObject(params).createReadStream();
};

export const getCasesByUserId = async (userId: string): Promise<HydratedDocument<ICase>[]> => {
    return Case.find({ userId });
};

const cleanPdfText = (text: string): string => {
    return text
        .replace(/\n/g, ' ')
        .replace(/\s\s+/g, ' ')
        .trim();
};

const createSummaryPDF = async (summary: string, caseId: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                }
            });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            doc.registerFont('CustomFont', path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf'));
            doc.font('CustomFont');

            doc.fontSize(16).text('Belge Özeti', {
                align: 'center',
                width: doc.page.width - 100
            });
            
            doc.moveDown(2);

            doc.fontSize(12).text(summary, {
                align: 'justify',
                width: doc.page.width - 100,
                lineGap: 5,
                indent: 20,  
            });
            
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

const uploadSummaryToS3 = async (pdfBuffer: Buffer, caseId: string): Promise<string> => {
    const key = `summaries/${caseId}/summary.pdf`;
    
    await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf'
    }).promise();

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

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

        const pdfBuffer = await createSummaryPDF(summary, caseId);
        const summaryFileUrl = await uploadSummaryToS3(pdfBuffer, caseId);

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

export const deleteCases = async (caseIds: string[], userId: string): Promise<{ 
    success: string[], 
    failed: string[] 
}> => {
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

            if (caseToDelete.fileUrl || caseToDelete.summaryFileUrl) {
                try {
                    const deletePromises = [];

                    if (caseToDelete.fileUrl) {
                        const fileKey = caseToDelete.fileUrl.split('.com/')[1];
                        deletePromises.push(
                            s3.deleteObject({
                                Bucket: process.env.AWS_S3_BUCKET_NAME as string,
                                Key: fileKey
                            }).promise()
                        );
                    }

                    if (caseToDelete.summaryFileUrl) {
                        const summaryKey = caseToDelete.summaryFileUrl.split('.com/')[1];
                        deletePromises.push(
                            s3.deleteObject({
                                Bucket: process.env.AWS_S3_BUCKET_NAME as string,
                                Key: summaryKey
                            }).promise()
                        );
                    }

                    await Promise.all(deletePromises);
                } catch (error) {
                    logger.error('Error deleting files from S3:', error);
                }
            }

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

    return results;
};

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

export async function getCases(userId: string) {
    return await Case.find({ userId })
        .select('_id userId title description fileUrl textContent summary summaryFileUrl stats createdAt updatedAt')
        .sort({ createdAt: -1 });
}