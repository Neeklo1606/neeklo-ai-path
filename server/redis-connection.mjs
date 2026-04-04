/**
 * Shared Redis connection for BullMQ (queue + worker + queue events).
 * Env: REDIS_URL (default redis://127.0.0.1:6379)
 */
import IORedis from "ioredis";

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

/** BullMQ requires maxRetriesPerRequest: null */
export const redisConnection = new IORedis(url, {
  maxRetriesPerRequest: null,
});
