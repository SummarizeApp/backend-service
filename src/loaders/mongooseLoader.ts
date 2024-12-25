import mongoose from 'mongoose';
import { dbConfig } from '../config/dbConfig';
import { Logger } from '../utils/logger';

export const mongooseLoader = async (): Promise<void> => {
    try {
        Logger.info('Connecting to MongoDB...');
        await mongoose.connect(dbConfig.mongoUri);
        Logger.info('Connected to MongoDB');
    } catch (error) {
        Logger.error('MongoDB connection error', error);
        throw error;
    }
};
