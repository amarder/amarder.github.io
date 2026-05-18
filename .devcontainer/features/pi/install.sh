#!/bin/sh
set -e

VERSION="${VERSION:-latest}"

echo "Installing Pi Coding Agent (https://pi.dev/) version: ${VERSION}"

if [ "${VERSION}" = "latest" ]; then
    npm install -g @earendil-works/pi-coding-agent
else
    npm install -g "@earendil-works/pi-coding-agent@${VERSION}"
fi

echo "Pi installed successfully: $(pi --version 2>/dev/null || echo 'version check unavailable')"
