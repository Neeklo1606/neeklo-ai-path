#!/usr/bin/env bash
set -euo pipefail
cd /home/d/dsc23ytp/neeklo/public_html
cp .env.backup .env
sed -i '/^JWT_SECRET=/d' .env
sed -i '/^DATABASE_URL=/d' .env
JWT=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT" >> .env
echo "DATABASE_URL=file:./prisma/neeklo.sqlite" >> .env
grep -E '^(JWT_SECRET|DATABASE_URL)=' .env | sed 's/=.*/=***HIDDEN***/'
