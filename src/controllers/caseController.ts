import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { JwtPayload } from 'jsonwebtoken';
import { 
    createCaseWithFile, 
    getCasesByUserId, 
    saveSummaryWithPDF, 
    deleteCases, 
    getCaseStats, 
} from '../services/caseService';
import SummarizeClientService from '../services/summarizeClient';
import { Case } from '../models/caseModel';
import { S3Service } from '../services/s3Service'; 

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
        
        const response = await SummarizeClientService.getSummary(newCase.textContent as string);
        
        if(response.status === "success" && response.summary) {
            await saveSummaryWithPDF(newCase._id.toString(), response.summary);
            newCase.summary = response.summary;
            await newCase.save();
            
            const updatedCase = await Case.findById(newCase._id)
                .select('+textContent +summary +fileUrl +summaryFileUrl');
            
            ApiResponse.success(res, 'Case created and summarized successfully', updatedCase);
        } else {
            const caseWithUrls = await Case.findById(newCase._id)
                .select('+textContent +summary +fileUrl +summaryFileUrl');
                
            ApiResponse.success(res, 'Case created but summarization failed', caseWithUrls);
        }
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
        const fileStream = await S3Service.getFile(caseId, fileName);
        fileStream.pipe(res);
    } catch (error: any) {
        logger.error('Error in downloadFileController', error);
        ApiResponse.internalServerError(res, 'Error downloading file');
    }
};

export const getUserCasesController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'User not authenticated');
            return;
        }
        const userId = (req.user as JwtPayload).id || req.user;
        const cases = await getCasesByUserId(userId);
        ApiResponse.success(res, 'User cases fetched successfully', cases);
    } catch (error: any) {
        logger.error('Error in getUserCasesController', error);
        ApiResponse.internalServerError(res, 'Error fetching user cases');
    }
};

export const deleteCasesController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'User not authenticated');
            return;
        }

        const userId = (req.user as JwtPayload).id || req.user;
        const { caseIds } = req.body;

        if (!Array.isArray(caseIds) || !caseIds.length) {
            ApiResponse.badRequest(res, 'caseIds must be a non-empty array');
            return;
        }

        const results = await deleteCases(caseIds, userId);
        
        ApiResponse.success(res, 'Delete operation completed', {
            successfulDeletes: results.success,
            failedDeletes: results.failed
        });
    } catch (error: any) {
        logger.error('Error in deleteCasesController:', error);
        ApiResponse.internalServerError(res, 'Error deleting case(s)');
    }
};

export const getCaseStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            ApiResponse.unauthorized(res, 'User not authenticated');
            return;
        }
        const userId = (req.user as JwtPayload).id || req.user;
        
        const stats = await getCaseStats(userId);
        ApiResponse.success(res, 'Case statistics fetched successfully', stats);
    } catch (error: any) {
        logger.error('Error in getCaseStatsController:', error);
        ApiResponse.internalServerError(res, 'Error fetching case statistics');
    }
};
