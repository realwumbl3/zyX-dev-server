#!/bin/bash

# BoilerPlate Setup Script
# This script installs dependencies and configures the systemd service

set -e  # Exit on any error

# Configuration variables
PROJECT_ROOT="&PROJECT_ROOT"
BACKEND_DIR="&PROJECT_ROOT/backend/&VERSION"
VERSION="&VERSION"
APP_NAME="&APP_NAME"
USERNAME="&USERNAME"

echo "Setting up BoilerPlate v1-01..."
echo "Project root: $PROJECT_ROOT"
echo "Backend dir: $BACKEND_DIR"

# Create and set up Python virtual environment (as user)
echo "Setting up Python virtual environment..."
cd "$BACKEND_DIR"
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi
echo "Activating virtual environment..."
source .venv/bin/activate

# Install Python requirements
echo "Installing Python requirements..."
pip install -r requirements.txt

# Enter sudo mode for system configuration
sudo -s << EOF

# Set up systemd service
echo "Setting up systemd service..."
export PROJECT_ROOT="$PROJECT_ROOT"

# Clean up any existing service configuration
systemctl disable $APP_NAME.$VERSION.service 2>/dev/null || true
systemctl reset-failed $APP_NAME.$VERSION.service 2>/dev/null || true
rm -f /etc/systemd/system/$APP_NAME.$VERSION.service

# Copy the service file to systemd directory (more reliable than symlinks)
cp "\$PROJECT_ROOT/instance/$VERSION/deploy/service.service" /etc/systemd/system/$APP_NAME.$VERSION.service

# Reload systemd daemon
systemctl daemon-reload

# Enable the service
systemctl enable $APP_NAME.$VERSION.service

# Start the service to create the socket file
systemctl start $APP_NAME.$VERSION.service

# Wait for the socket to be created
sleep 2

# Set permissions on the unix socket (should exist now)
chmod 770 "\$PROJECT_ROOT/instance/$VERSION/$APP_NAME.sock" || echo "Warning: Could not set socket permissions"
chown $USERNAME:www-data "\$PROJECT_ROOT/instance/$VERSION/$APP_NAME.sock" || echo "Warning: Could not set socket ownership"

# Test and reload nginx (now that socket exists)
nginx -t && systemctl reload nginx

echo "Setup completed successfully!"
echo "You can now start the service with: sudo systemctl start $APP_NAME.$VERSION"

EOF
