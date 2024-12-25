import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

interface AuthRequest extends Request {
    user?: string | JwtPayload; 
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ApiResponse.unauthorized(res, 'Authorization token missing or invalid');
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        ApiResponse.unauthorized(res, 'Invalid or expired token');
    }
};
