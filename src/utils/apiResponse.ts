import { Response } from 'express';

interface IResponse<T> {
    status: 'success' | 'error';
    msg: string;
    data?: T | null;
    errors?: any;
}

export class ApiResponse{
    static success<T>(res: Response, msg: string, data?: T, statusCode: number = 200): Response<IResponse<T>> {
        return res.status(statusCode).json({
            status: 'success',
            msg,
            data: data || null,
        });
    }

    static error(res: Response, msg: string, statusCode: number = 500, errors?: any): Response<IResponse<null>> {
        return res.status(statusCode).json({
            status: 'error',
            msg,
            data: null,
            errors: errors || null,
        });
    }

    static badRequest(res: Response, msg: string, errors?: any): Response<IResponse<null>> {
        return this.error(res, msg, 400, errors);
    }

    static unauthorized(res: Response, msg: string): Response<IResponse<null>> {
        return this.error(res, msg, 401);
    }

    static notFound(res: Response, msg: string): Response<IResponse<null>> {
        return this.error(res, msg, 404);
    }

    static internalServerError(res: Response, msg: string, errors?: any): Response<IResponse<null>> {
        return this.error(res, msg, 500, errors);
    }
}