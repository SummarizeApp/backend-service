import dotenv from 'dotenv';
dotenv.config();

import { mongooseLoader } from './loaders/mongooseLoader';
import { serverLoader } from './loaders/serverLoader';
import { Logger } from './utils/logger';

const startServer = async (): Promise<void> => {
    try {
        Logger.info('Starting the server...');

        await mongooseLoader();

        serverLoader();
    } catch (error) {
        Logger.error('Error while starting the application', error);
        process.exit(1); 
    }
};

startServer();
