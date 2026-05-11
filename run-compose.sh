#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo
  echo "Stopping application processes..."

  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

ensure_port_free() {
  local port="$1"

  if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use."
    echo "Stop the process on port $port, then rerun ./run-compose.sh."
    exit 1
  fi

  if (echo >"/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1; then
    echo "Port $port is already in use."
    echo "Stop the process on port $port, then rerun ./run-compose.sh."
    exit 1
  fi
}

run_docker_compose() {
  if docker compose "$@"; then
    return 0
  fi

  if command -v sudo >/dev/null 2>&1; then
    echo "Docker compose needs elevated permissions. Trying with sudo..."
    sudo docker compose "$@"
    return $?
  fi

  echo "Docker compose could not run with the current user, and sudo is not available."
  echo "Run this first, then rerun ./run-compose.sh:"
  echo "  docker compose up -d mongodb"
  exit 1
}

ensure_command docker
ensure_command npm

ensure_port_free 3000
ensure_port_free 4200

echo "Starting MongoDB..."
run_docker_compose up -d mongodb

if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  echo "Creating backend/.env from backend/.env.example..."
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
fi

if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
  echo "Installing backend dependencies..."
  (cd "$BACKEND_DIR" && npm install)
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

echo "Starting backend on http://localhost:3000 ..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:4200 ..."
(cd "$FRONTEND_DIR" && NG_CLI_ANALYTICS=false CI=true npm start -- --port 4200) &
FRONTEND_PID=$!

echo
echo "Application is starting."
echo "Frontend: http://localhost:4200"
echo "Backend:  http://localhost:3000"
echo "Press Ctrl+C to stop backend and frontend."

wait "$BACKEND_PID" "$FRONTEND_PID"
