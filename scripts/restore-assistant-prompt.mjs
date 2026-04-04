/**
 * One-off: restore default sales system prompt for assistant id (from env ASSISTANT_ID).
 * Load DATABASE_URL from environment (export from PM2 before run).
 */
import { PrismaClient } from "@prisma/client";

const id = process.env.ASSISTANT_ID || "a04a58e3-62c5-477d-a7ce-5240f3f8ea00";
const prompt = `Ты — менеджер по продажам.

Твоя задача:
— выявить потребность клиента
— предложить решение
— довести до заявки

Правила:
— отвечай кратко
— задавай 1 вопрос за раз
— не уходи в общие рассуждения

Если клиент говорит "дорого":
— объясни ценность
— не снижай цену

Цель:
довести до контакта или заказа.`;

const p = new PrismaClient();
await p.assistant.update({
  where: { id },
  data: { systemPrompt: prompt, temperature: 0.7 },
});
console.log("restored", id);
await p.$disconnect();
