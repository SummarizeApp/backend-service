import mongoose from 'mongoose';
import { dbConfig } from '../config/dbConfig';

export const mongooseLoader = async (): Promise<void> => {
    try {
        await mongoose.connect(dbConfig.mongoUri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', (error as Error).message);
        throw error;
    }
};
