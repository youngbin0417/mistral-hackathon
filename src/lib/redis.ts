import Redis from 'ioredis';
import { logger } from './logger';

// Standard interface for our cache operations
interface CacheStore {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: any[]): Promise<any>;
    lpush(key: string, value: string): Promise<any>;
    lrange(key: string, start: number, stop: number): Promise<string[]>;
    ltrim(key: string, start: number, stop: number): Promise<any>;
}

// In-memory fallback
class MemoryStore implements CacheStore {
    private store = new Map<string, string>();
    private lists = new Map<string, string[]>();

    async get(key: string) { return this.store.get(key) || null; }
    async set(key: string, value: string): Promise<'OK'> {
        this.store.set(key, value);
        return 'OK';
    }
    async lpush(key: string, value: string) {
        const list = this.lists.get(key) || [];
        list.unshift(value);
        this.lists.set(key, list);
        return list.length;
    }
    async lrange(key: string, start: number, stop: number) {
        const list = this.lists.get(key) || [];
        return list.slice(start, stop + 1);
    }
    async ltrim(key: string, start: number, stop: number): Promise<'OK'> {
        const list = this.lists.get(key) || [];
        this.lists.set(key, list.slice(start, stop + 1));
        return 'OK';
    }
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const memoryStore = new MemoryStore();

// Instead of exporting the client directly, we export a proxy/wrapper
class CacheManager implements CacheStore {
    private client: Redis | null = null;
    public useMemoryFallback = false;
    private hasLoggedError = false;

    constructor() {
        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 1,
                connectTimeout: 2000,
                // Do not retry endlessly if no server is found
                retryStrategy: (times) => {
                    if (times > 1) {
                        this.enableFallback();
                        return null; // Stop retrying
                    }
                    return Math.min(times * 100, 3000);
                }
            });

            this.client.on("error", (err) => {
                this.enableFallback();
                if (!this.hasLoggedError) {
                    logger.warn("Redis connection failed. Switching to in-memory cache. Run 'docker compose up -d' in the observability folder to enable Redis.");
                    this.hasLoggedError = true;
                }
            });

            this.client.on("connect", () => {
                this.useMemoryFallback = false;
                this.hasLoggedError = false;
                logger.info("Connected to Redis. Cache is now persistent.");
            });
        } catch (e) {
            this.enableFallback();
        }
    }

    private enableFallback() {
        this.useMemoryFallback = true;
        if (this.client) {
            this.client.disconnect();
            this.client = null;
        }
    }

    private get store(): CacheStore {
        return (this.useMemoryFallback || !this.client) ? memoryStore : this.client;
    }

    async get(key: string) { return this.store.get(key); }
    async set(key: string, value: string, ...args: any[]) { return this.store.set(key, value, ...args); }
    async lpush(key: string, value: string) { return this.store.lpush(key, value); }
    async lrange(key: string, start: number, stop: number) { return this.store.lrange(key, start, stop); }
    async ltrim(key: string, start: number, stop: number) { return this.store.ltrim(key, start, stop); }
}

export const redis = new CacheManager();
