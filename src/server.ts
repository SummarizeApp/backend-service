import dotenv from 'dotenv';
dotenv.config();

import { mongooseLoader } from './loaders/mongooseLoader';
import { redisLoader } from './loaders/redisLoader';
import { serverLoader } from './loaders/serverLoader';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
    try {
        logger.info('Starting the server...');

        await mongooseLoader();

        await redisLoader();

        serverLoader();
    } catch (error) {
        logger.error('Error while starting the application', error);
        process.exit(1); 
    }
};

startServer();
