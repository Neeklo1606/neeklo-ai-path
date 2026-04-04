/**
 * PM2: из корня проекта:
 *   pm2 start deploy/beget/ecosystem.config.cjs && pm2 save
 */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "neeklo-api",
      script: "server/cms-server.mjs",
      interpreter: "node",
      cwd: path.resolve(__dirname, "../.."),
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
