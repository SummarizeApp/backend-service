import express from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

router.get('', async (req, res) => {
    try {
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now(),
            mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            services: {
                database: 'OK',
                redis: 'OK',
                s3: 'OK'
            }
        };
        
        ApiResponse.success(res, 'Health check successful', healthcheck);
    } catch (error) {
        ApiResponse.internalServerError(res, 'Health check failed');
    }
});

export default router; 