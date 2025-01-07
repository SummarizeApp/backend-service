import { getRedisClient } from '../loaders/redisLoader';
import logger from '../utils/logger';

export class RedisService {
    private static CASE_LIST_PREFIX = 'case_list:';
    private static DEFAULT_CACHE_TTL = 3600;

    static async getCachedCases(userId: string): Promise<string | null> {
        try {
            const redis = getRedisClient();
            return await redis.get(`${this.CASE_LIST_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis get error:', error);
            return null;
        }
    }

    static async setCachedCases(userId: string, cases: any): Promise<void> {
        try {
            const redis = getRedisClient();
            await redis.setex(
                `${this.CASE_LIST_PREFIX}${userId}`,
                this.DEFAULT_CACHE_TTL,
                JSON.stringify(cases)
            );
        } catch (error) {
            logger.error('Redis set error:', error);
        }
    }

    static async invalidateCaseCache(userId: string): Promise<void> {
        try {
            const redis = getRedisClient();
            await redis.del(`${this.CASE_LIST_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis delete error:', error);
        }
    }
} 