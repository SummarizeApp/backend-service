import dotenv from 'dotenv';
dotenv.config();

import { mongooseLoader } from './loaders/mongooseLoader';
import { serverLoader } from './loaders/serverLoader';

const startServer = async (): Promise<void> => {
    try {
        await mongooseLoader();

        serverLoader();
    } catch (error) {
        console.error('Error while starting the application:', error);
        process.exit(1); 
    }
};

startServer();
