#!/usr/bin/env bash
set -euo pipefail

BUN_VERSION="1.2.23"

if command -v bun &>/dev/null; then
  INSTALLED=$(bun --version 2>/dev/null || echo "unknown")
  if [ "$INSTALLED" = "$BUN_VERSION" ]; then
    echo "bun $BUN_VERSION is already installed."
    exit 0
  fi
  echo "bun $INSTALLED is installed; upgrading to $BUN_VERSION..."
fi

curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}"

echo "bun $BUN_VERSION installed successfully."
