/**
 * Run on server: OLLAMA_URL=http://188.124.55.89:11434 node scripts/test-node-fetch-embed.mjs
 */
const base = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
console.log("OLLAMA BASE:", base);
const r = await fetch(`${base}/api/embeddings`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "nomic-embed-text", prompt: "hi" }),
  signal: AbortSignal.timeout(10_000),
});
const t = await r.text();
console.log("status", r.status);
console.log("body", t.slice(0, 400));
