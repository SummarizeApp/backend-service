import Redis from 'ioredis';
import { redisConfig } from '../config/redisConfig';
import logger from '../utils/logger';

class RedisService {
    private static instance: Redis;
    private static readonly CASE_LIST_PREFIX = 'case_list:';
    private static readonly DEFAULT_CACHE_TTL = 3600;

    public static getInstance(): Redis {
        if (!RedisService.instance) {
            RedisService.instance = new Redis({
                host: process.env.REDIS_HOST || 'redis',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                retryStrategy: (times) => {
                    return Math.min(times * 100, 3000);
                }
            });

            RedisService.instance.on('error', (error) => {
                logger.error('Redis Error:', error);
            });

            RedisService.instance.on('connect', () => {
                logger.info('Connected to Redis');
            });
        }
        return RedisService.instance;
    }

    public static async getCachedCases(userId: string): Promise<string | null> {
        try {
            const redis = this.getInstance();
            return await redis.get(`${this.CASE_LIST_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis get error:', error);
            return null;
        }
    }

    public static async setCachedCases(userId: string, cases: any): Promise<void> {
        try {
            const redis = this.getInstance();
            await redis.setex(
                `${this.CASE_LIST_PREFIX}${userId}`,
                this.DEFAULT_CACHE_TTL,
                JSON.stringify(cases)
            );
        } catch (error) {
            logger.error('Redis set error:', error);
        }
    }

    public static async invalidateCaseCache(userId: string): Promise<void> {
        try {
            const redis = this.getInstance();
            await redis.del(`${this.CASE_LIST_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis delete error:', error);
        }
    }
}

export default RedisService; 