#!/usr/bin/env bash
# Appends only missing CMS/Prisma vars; does not overwrite existing keys.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1
ENVF=".env"
test -f "$ENVF"

if ! grep -q '^JWT_SECRET=' "$ENVF"; then
  {
    echo ""
    echo "# auto-added $(date -u +%Y-%m-%dT%H:%MZ)"
    printf 'JWT_SECRET=%s\n' "$(openssl rand -hex 32)"
  } >> "$ENVF"
fi

grep -q '^PORT=' "$ENVF" || echo 'PORT=8787' >> "$ENVF"
grep -q '^CMS_SERVER_PORT=' "$ENVF" || echo 'CMS_SERVER_PORT=8787' >> "$ENVF"

echo "merge-server-env: done (set DATABASE_URL manually if missing)"
