export const redisConfig = {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    // Redis'in yeniden bağlanma stratejisi
    retryStrategy: (times: number) => {
        if (times > 3) {
            return null; // 3 denemeden sonra durdur
        }
        return Math.min(times * 1000, 3000); // Her denemede artan bekleme süresi
    }
}; 