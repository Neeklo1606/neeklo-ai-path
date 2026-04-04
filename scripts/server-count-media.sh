#!/bin/bash
set -euo pipefail
cd /var/www/neeklo.ru
VAL="$(pm2 env 8 2>/dev/null | grep '^DATABASE_URL:' | sed 's/^DATABASE_URL:[[:space:]]*//')"
export DATABASE_URL="$VAL"
node -e 'const { PrismaClient } = require("@prisma/client"); const db = new PrismaClient(); db.media.count().then(c => { console.log("MEDIA COUNT:", c); process.exit(0); });'
