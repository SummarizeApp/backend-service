import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack);
    ApiResponse.internalServerError(res, 'Internal Server Error', err.message);
};