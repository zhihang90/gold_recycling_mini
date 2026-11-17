#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

rm -rf "$ROOT/dist"
NODE_ENV=production npx vite build --outDir "$ROOT/dist" --emptyOutDir

# 托管目录里混入 .DS_Store 会被当成可访问文件
find "$ROOT/dist" -name .DS_Store -delete

echo "Build complete"
echo "  dist → $ROOT/dist"
