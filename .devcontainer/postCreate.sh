#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

pnpm install
sudo env "PATH=$PATH" pnpm exec playwright install-deps chromium
pnpm exec playwright install chromium
