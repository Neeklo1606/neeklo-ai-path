/**
 * BullMQ queue "chat" — Ollama/RAG turns processed by server/chat-worker.mjs.
 * Env: REDIS_URL
 */
import { Queue, QueueEvents } from "bullmq";
import { redisConnection } from "./redis-connection.mjs";

export const CHAT_QUEUE_NAME = "chat";

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1500 },
  removeOnComplete: 500,
  removeOnFail: 200,
};

let _queue;
let _queueEvents;

export function getChatQueue() {
  if (!_queue) {
    _queue = new Queue(CHAT_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions,
    });
  }
  return _queue;
}

export function getChatQueueEvents() {
  if (!_queueEvents) {
    _queueEvents = new QueueEvents(CHAT_QUEUE_NAME, { connection: redisConnection });
  }
  return _queueEvents;
}
