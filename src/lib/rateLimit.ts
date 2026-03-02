import { redis } from './redis';
import { logger } from './logger';

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export async function rateLimit(
    identifier: string,
    limit: number = 1000,
    windowSeconds: number = 60
): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % windowSeconds);
    const reset = windowStart + windowSeconds;

    try {
        // We use a simple count for the window
        // In Redis, we can use INCR and EXPIRE
        // Redis Multi would be better but let's keep it simple for our abstraction

        const current = await redis.get(key);
        const count = current ? parseInt(current, 10) : 0;

        if (count >= limit) {
            return {
                success: false,
                limit,
                remaining: 0,
                reset
            };
        }

        const newCount = count + 1;
        await redis.set(key, newCount.toString(), 'EX', windowSeconds);

        return {
            success: true,
            limit,
            remaining: limit - newCount,
            reset
        };
    } catch (err) {
        logger.warn({ err }, "Rate limiter error, allowing request by default");
        return {
            success: true,
            limit,
            remaining: 1,
            reset
        };
    }
}
