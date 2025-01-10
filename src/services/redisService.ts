import Redis from 'ioredis';
import { redisConfig } from '../config/redisConfig';
import logger from '../utils/logger';

class RedisService {
    private static instance: RedisService;
    private client: Redis;
    private static readonly CASE_LIST_PREFIX = 'case_list:';
    private static readonly DEFAULT_CACHE_TTL = 3600;
    private static readonly PROFILE_PREFIX = 'user_profile:';

    private constructor() {
        this.client = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password
        });

        this.client.on('error', (error) => {
            logger.error('Redis Client Error:', error);
        });

        this.client.on('connect', () => {
            logger.info('Connected to Redis');
        });
    }

    static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public static async getCachedCases(userId: string): Promise<string | null> {
        try {
            const redis = this.getInstance();
            return await redis.get(`${RedisService.CASE_LIST_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis get error:', error);
            return null;
        }
    }

    public static async setCachedCases(userId: string, cases: any): Promise<void> {
        try {
            const redis = this.getInstance();
            await redis.setex(
                `${RedisService.CASE_LIST_PREFIX}${userId}`,
                RedisService.DEFAULT_CACHE_TTL,
                JSON.stringify(cases)
            );
        } catch (error) {
            logger.error('Redis set error:', error);
        }
    }

    public static async invalidateCaseCache(userId: string): Promise<void> {
        try {
            const redis = this.getInstance();
            await redis.del(`${RedisService.CASE_LIST_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis delete error:', error);
        }
    }

    public static async getCachedProfile(userId: string): Promise<string | null> {
        try {
            const redis = this.getInstance();
            return await redis.get(`${RedisService.PROFILE_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis get profile error:', error);
            return null;
        }
    }

    public static async setCachedProfile(userId: string, profile: any): Promise<void> {
        try {
            const redis = this.getInstance();
            await redis.setex(
                `${RedisService.PROFILE_PREFIX}${userId}`,
                RedisService.DEFAULT_CACHE_TTL,
                JSON.stringify(profile)
            );
        } catch (error) {
            logger.error('Redis set profile error:', error);
        }
    }

    public static async invalidateProfileCache(userId: string): Promise<void> {
        try {
            const redis = this.getInstance();
            await redis.del(`${RedisService.PROFILE_PREFIX}${userId}`);
        } catch (error) {
            logger.error('Redis delete profile error:', error);
        }
    }

    async setOTP(userId: string, otpCode: string, expirySeconds: number): Promise<void> {
        try {
            const key = `otp:${userId}`;
            await this.client.setex(key, expirySeconds, otpCode);
            logger.info(`OTP set for userId: ${userId}`);
        } catch (error) {
            logger.error('Error setting OTP:', error);
            throw new Error('Failed to set OTP');
        }
    }

    async getOTP(userId: string): Promise<string | null> {
        try {
            const key = `otp:${userId}`;
            const otp = await this.client.get(key);
            return otp;
        } catch (error) {
            logger.error('Error getting OTP:', error);
            throw new Error('Failed to get OTP');
        }
    }

    async deleteOTP(userId: string): Promise<number> {
        try {
            const key = `otp:${userId}`;
            const result = await this.client.del(key);
            if (result === 1) {
                logger.info(`OTP deleted for userId: ${userId}`);
            }
            return result;
        } catch (error) {
            logger.error('Error deleting OTP:', error);
            throw new Error('Failed to delete OTP');
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string): Promise<void> {
        await this.client.set(key, value);
    }

    async setex(key: string, seconds: number, value: string): Promise<void> {
        await this.client.setex(key, seconds, value);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    async ping(): Promise<string> {
        return this.client.ping();
    }
}

export default RedisService; 