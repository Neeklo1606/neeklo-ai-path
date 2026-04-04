#!/bin/bash
set -euo pipefail
KEY="$HOME/.ssh/id_ed25519_neeklo_github"
if [ ! -f "$KEY" ]; then
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "server@neeklo"
  echo "Generated $KEY"
else
  echo "Key already exists: $KEY"
fi

CFG="$HOME/.ssh/config"
if ! grep -q 'Host github.com-neeklo' "$CFG" 2>/dev/null; then
  {
    echo ''
    echo 'Host github.com-neeklo'
    echo '  HostName github.com'
    echo '  User git'
    echo "  IdentityFile $KEY"
    echo '  IdentitiesOnly yes'
  } >> "$CFG"
  chmod 600 "$CFG"
  echo "Appended Host github.com-neeklo to $CFG"
fi

cd /var/www/neeklo.ru
git remote set-url origin git@github.com-neeklo:Neeklo1606/neeklo-ai-path.git
echo '=== git remote -v ==='
git remote -v
echo '=== PUBLIC KEY (add to GitHub Neeklo1606 → SSH keys) ==='
cat "${KEY}.pub"
