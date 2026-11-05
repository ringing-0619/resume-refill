#!/bin/sh
cd "$(dirname "$0")" || exit 1
demo_node="$(command -v node 2>/dev/null || true)"
for candidate in "$demo_node" /usr/local/bin/node /opt/homebrew/bin/node; do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    exec "$candidate" scripts/launch-demo.mjs --stop
  fi
done
printf '未找到 Node.js，无法检查演示服务。\n'
exit 1
