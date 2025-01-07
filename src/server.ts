import app from './app';
import { mongooseLoader } from './loaders/mongooseLoader';
import { redisLoader } from './loaders/redisLoader';
import logger from './utils/logger';

const startServer = async () => {
    try {
        await mongooseLoader();
        await redisLoader();

        const port = process.env.PORT || 3000;
        
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
