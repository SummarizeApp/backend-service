import { Request, Response } from 'express';
import { createCaseWithFile, getFileFromS3 } from '../services/caseService';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: string | JwtPayload; 
}

export const createCaseWithFileController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'User not authenticated');
            return;
        }
        const userId = (req.user as JwtPayload).id || req.user;
        const { title, description } = req.body;
        const file = req.file;

        if (!file) {
            ApiResponse.badRequest(res, 'File is required');
            return;
        }

        const newCase = await createCaseWithFile(userId, title, description, file);
        ApiResponse.success(res, 'Case created and file uploaded successfully', newCase);
    } catch (error: any) {
        logger.error('Error in createCaseWithFileController', error);
        ApiResponse.internalServerError(res, 'Error creating case and uploading file');
    }
};

export const downloadFileController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'User not authenticated');
            return;
        }
        const { caseId, fileName } = req.params;
        const fileStream = await getFileFromS3(caseId, fileName);
        fileStream.pipe(res);
    } catch (error: any) {
        logger.error('Error in downloadFileController', error);
        ApiResponse.internalServerError(res, 'Error downloading file');
    }
};

