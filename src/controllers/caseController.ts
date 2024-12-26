import { Request, Response } from 'express';
import { createCaseWithFile } from '../services/caseService';
import { ApiResponse } from '../utils/apiResponse';
import { Logger } from '../utils/logger';
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
        Logger.error('Error in createCaseWithFileController', error);
        ApiResponse.internalServerError(res, 'Error creating case and uploading file');
    }
};