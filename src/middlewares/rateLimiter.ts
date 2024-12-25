import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // Her IP için 15 dakika içinde maksimum 100 istek
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
