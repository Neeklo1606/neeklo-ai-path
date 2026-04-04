/**
 * Processes "chat" queue: Ollama + RAG via chatWithRag.
 * Run: node server/chat-worker.mjs (PM2: chat-worker)
 * Env: DATABASE_URL, REDIS_URL, OLLAMA_URL, QDRANT_URL, …
 */
import "dotenv/config";
import { Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { chatWithRag } from "./services/ai.service.mjs";
import { redisConnection } from "./redis-connection.mjs";
import { CHAT_QUEUE_NAME } from "./chat-queue.mjs";

const prisma = new PrismaClient();

const worker = new Worker(
  CHAT_QUEUE_NAME,
  async (job) => {
    const { assistantId, messages } = job.data || {};
    if (!assistantId || !Array.isArray(messages)) {
      throw new Error("Invalid job payload: assistantId and messages[] required");
    }
    const assistant = await prisma.assistant.findUnique({ where: { id: assistantId } });
    if (!assistant) {
      throw new Error("Assistant not found");
    }
    return chatWithRag({ assistant, messages });
  },
  {
    connection: redisConnection,
    concurrency: 2,
  },
);

worker.on("failed", (job, err) => {
  console.error("[chat-worker] job failed", job?.id, err?.message || err);
});

worker.on("completed", (job) => {
  console.log("[chat-worker] completed", job.id);
});

console.log("[chat-worker] listening on queue", CHAT_QUEUE_NAME, "concurrency=2");
