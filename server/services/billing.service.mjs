/**
 * Billing: balance checks, cost from env, usage logs (Prisma).
 * Env: BILLING_INITIAL_BALANCE, BILLING_COST_PER_MESSAGE, BILLING_COST_PER_1K_TOKENS, BILLING_RATE_LIMIT_PER_MIN
 */

/** @param {import('@prisma/client').PrismaClient} prisma */
export function getBillingConfig() {
  const initial = Number(process.env.BILLING_INITIAL_BALANCE ?? "100");
  const perMessage = Number(process.env.BILLING_COST_PER_MESSAGE ?? "0");
  const per1k = Number(process.env.BILLING_COST_PER_1K_TOKENS ?? "0.001");
  const ratePerMin = Math.max(1, parseInt(String(process.env.BILLING_RATE_LIMIT_PER_MIN ?? "60"), 10) || 60);
  return {
    initialBalance: Number.isFinite(initial) ? initial : 100,
    costPerMessage: Number.isFinite(perMessage) ? perMessage : 0,
    costPer1kTokens: Number.isFinite(per1k) ? per1k : 0.001,
    rateLimitPerMin: ratePerMin,
  };
}

/**
 * @param {{ costPerMessage: number, costPer1kTokens: number }} cfg
 * @param {{ promptTokens: number, completionTokens: number, messageCount?: number }} u
 */
export function computeUsageCost(cfg, u) {
  const msg = u.messageCount ?? 1;
  const tokens = Math.max(0, (u.promptTokens || 0) + (u.completionTokens || 0));
  return cfg.costPerMessage * msg + (cfg.costPer1kTokens * tokens) / 1000;
}

/** Approximate tokens when Ollama omits eval counts. */
export function estimateTokensFromText(parts) {
  const len = parts.filter(Boolean).join(" ").length;
  return Math.max(1, Math.ceil(len / 4));
}

const WINDOW_MS = 60_000;
const buckets = new Map();

/** @returns {boolean} true if allowed */
export function rateLimitByKeyHash(keyHash, maxPerWindow) {
  const now = Date.now();
  let b = buckets.get(keyHash);
  if (!b || now >= b.resetAt) {
    b = { n: 0, resetAt: now + WINDOW_MS };
    buckets.set(keyHash, b);
  }
  b.n += 1;
  return b.n <= maxPerWindow;
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} assistantId
 */
export async function ensureApiKeyForAssistant(prisma, assistantId) {
  const cfg = getBillingConfig();
  const existing = await prisma.apiKey.findUnique({ where: { assistantId } });
  if (existing) return existing;
  return prisma.apiKey.create({
    data: {
      key: assistantId,
      assistantId,
      balance: cfg.initialBalance,
      isActive: true,
    },
  });
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} apiKeyId
 * @param {{ tokensApprox: number, messagesCount: number, cost: number, path?: string }} row
 */
export async function deductBalanceAndLog(prisma, apiKeyId, row) {
  const cost = Math.max(0, Number(row.cost) || 0);
  return prisma.$transaction(async (tx) => {
    const ak = await tx.apiKey.findUnique({ where: { id: apiKeyId } });
    if (!ak) throw new Error("ApiKey not found");
    const next = Math.max(0, (Number(ak.balance) || 0) - cost);
    await tx.apiKey.update({
      where: { id: apiKeyId },
      data: { balance: next },
    });
    await tx.usageLog.create({
      data: {
        apiKeyId,
        tokensApprox: row.tokensApprox,
        messagesCount: row.messagesCount,
        cost,
        path: row.path || "chat",
      },
    });
    return { balance_after: next, cost_charged: cost };
  });
}
