#!/bin/bash
set -u

clear

# Force unbuffered output for this session
export PYTHONUNBUFFERED=1

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
NAME="BoilerPlate"
VERSION="$NAME-v1-03"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/../../" && pwd)"
INSTANCE_DIR="$PROJECT_ROOT/instance/$VERSION"
SERVICE_FILE=$NAME.$VERSION.service

LOG_FILE="$INSTANCE_DIR/$NAME.log"

# SIMPLE: restart the service, then tail the real log file
echo "Restarting $SERVICE_FILE..."
sudo systemctl restart "$SERVICE_FILE"

echo ""
echo "Following logs: $LOG_FILE (Press Ctrl+C to exit)"
echo "---"
tail -f "$LOG_FILE"
