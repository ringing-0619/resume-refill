#!/bin/sh
cd "$(dirname "$0")" || exit 1
demo_node="$(command -v node 2>/dev/null || true)"
for candidate in "$demo_node" /usr/local/bin/node /opt/homebrew/bin/node; do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    exec "$candidate" scripts/launch-demo.mjs "$@"
  fi
done
printf '请先安装 Node.js 22.14 或更新版本。\nNode.js 22.14+ is required.\n'
read -r answer
exit 1
