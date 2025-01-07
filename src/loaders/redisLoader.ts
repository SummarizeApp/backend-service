import Redis from 'ioredis';
import { redisConfig } from '../config/redisConfig';
import logger from '../utils/logger';

let redisClient: Redis;

export const redisLoader = async (): Promise<Redis> => {
    try {
        logger.info('Connecting to Redis...');
        
        redisClient = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            retryStrategy: redisConfig.retryStrategy,
            enableReadyCheck: true
        });

        redisClient.on('connect', () => {
            logger.info('Connected to Redis');
        });

        redisClient.on('error', (error) => {
            logger.error('Redis connection error:', error);
        });

        return redisClient;
    } catch (error) {
        logger.error('Redis connection error:', error);
        throw error;
    }
};

export const getRedisClient = (): Redis => {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
}; 