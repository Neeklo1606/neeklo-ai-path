/**
 * PM2 ecosystem for neeklo-api. Must use `.cjs` because package.json has "type": "module".
 * Loads project root `.env` and passes every key to the process (Prisma DATABASE_URL, Supabase keys, etc.).
 * Auto-deploy uses cron + deploy.sh (see deploy/crontab.example), not a webhook.
 *
 *   pm2 delete neeklo-api
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 */
const path = require("path");
const dotenv = require("dotenv");

const root = __dirname;
const parsed =
  dotenv.config({ path: path.join(root, ".env") }).parsed || {};

const env = {
  ...parsed,
  NODE_ENV: "production",
  OLLAMA_URL: parsed.OLLAMA_URL || "http://188.124.55.89:11434",
  QDRANT_URL: parsed.QDRANT_URL || "http://127.0.0.1:6333",
};

module.exports = {
  apps: [
    {
      name: "neeklo-api",
      script: "server/cms-server.mjs",
      interpreter: "node",
      cwd: root,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env,
    },
  ],
};
