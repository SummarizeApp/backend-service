import mongoose from 'mongoose';
import { dbConfig } from '../config/dbConfig';
import logger from '../utils/logger';

export const mongooseLoader = async (): Promise<void> => {
    try {
        logger.info('Connecting to MongoDB...');
        await mongoose.connect(dbConfig.mongoUri);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection error', error);
        throw error;
    }
};
