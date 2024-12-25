import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
    mongoUri: process.env.MONGO_URI || 'db',
};
