import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
        status: 'error',
        msg: 'Too many requests, please try again later',
        data: null,
        errors: null,
    },
    handler: (req, res, next, options) => {
        ApiResponse.error(res, 'Too many requests, please try again later', 429);
    },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, 
    message: {
        status: 'error',
        msg: 'Too many requests to auth endpoints, please try again later',
        data: null,
        errors: null,
    },
    handler: (req, res, next, options) => {
        ApiResponse.error(res, 'Too many requests to auth endpoints, please try again later', 429);
    },
});