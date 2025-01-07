import RedisService from '../services/redisService';
import logger from '../utils/logger';

export const redisLoader = async (): Promise<void> => {
    try {
        const redis = RedisService.getInstance();
        await redis.ping();
        logger.info('Redis connection established');
    } catch (error) {
        logger.error('Redis connection error:', error);
        throw error;
    }
}; 