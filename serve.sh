#!/usr/bin/env bash
# Start PawTrack as a server on this PC (production mode).
#
# - Reads configuration from .env (ENVIRONMENT=production, SECRET_KEY, DB, CORS).
# - Serves BOTH the web app and the API on http://<this-pc>:8000 (same origin).
# - --forwarded-allow-ips lets an HTTPS tunnel (cloudflared/ngrok) on this same
#   machine pass each visitor's real IP, so rate limits are per-friend.
#
# Prerequisite (one time, and after any frontend change):
#   cd frontend && npm run build
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d frontend/dist ]; then
  echo "frontend/dist not found. Build the web app first:" >&2
  echo "  cd frontend && npm run build" >&2
  exit 1
fi

exec .venv/bin/python -m uvicorn main:app \
  --host 0.0.0.0 --port 8000 \
  --forwarded-allow-ips="127.0.0.1"
