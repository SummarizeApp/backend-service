import { mongooseLoader } from './loaders/mongooseLoader';
import { redisLoader } from './loaders/redisLoader';
import { serverLoader } from './loaders/serverLoader';
import logger from './utils/logger';

const startServer = async () => {
    try {
        await mongooseLoader();
        await redisLoader();

        await serverLoader();
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
