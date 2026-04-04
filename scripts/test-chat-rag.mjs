#!/usr/bin/env node
/** POST /chat and print JSON (used_context, reply snippet). Run on API host. */
const body = JSON.stringify({
  messages: [{ role: "user", content: "что вы продаете?" }],
});
const r = await fetch("http://127.0.0.1:8787/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body,
});
const text = await r.text();
let j;
try {
  j = JSON.parse(text);
} catch {
  console.error("HTTP", r.status, text.slice(0, 500));
  process.exit(1);
}
console.log(JSON.stringify(j, null, 2));
