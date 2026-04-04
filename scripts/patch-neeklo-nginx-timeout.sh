#!/bin/bash
set -e
FILE=/etc/nginx/sites-available/neeklo.ru
if grep -q "proxy_read_timeout 300" "$FILE" 2>/dev/null; then
  echo "nginx: timeouts already in $FILE"
  exit 0
fi
cp "$FILE" "${FILE}.bak-timeout-$(date +%s)"
awk '
/proxy_set_header Connection "upgrade";/ {
  print
  print "        proxy_read_timeout 300;"
  print "        proxy_connect_timeout 300;"
  print "        proxy_send_timeout 300;"
  next
}
{ print }
' "$FILE" > /tmp/neeklo.ru.$$
mv /tmp/neeklo.ru.$$ "$FILE"
echo "nginx: patched $FILE"
nginx -t
systemctl reload nginx
echo "nginx: reloaded OK"
