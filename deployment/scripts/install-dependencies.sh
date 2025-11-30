#!/bin/bash
#
# Install system dependencies for IoT Monitoring Application
# This script installs Node.js, npm, nginx, MariaDB, PM2, and build tools
#

set -e

log "Installing system dependencies..."

# Update package list
log "Updating package lists..."
apt-get update -qq

# Install base packages
log "Installing base packages (nginx, mariadb, build tools)..."
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl wget git \
  nginx \
  mariadb-server \
  build-essential \
  python3 python3-pip \
  usbutils \
  apt-transport-https \
  ca-certificates \
  gnupg \
  lsb-release

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
  log "Installing Node.js 20.x from NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  log "Node.js installed: $(node --version)"
else
  NODE_VERSION=$(node --version)
  log "Node.js already installed: ${NODE_VERSION}"
fi

# Verify npm is available
if ! command -v npm &> /dev/null; then
  error "npm not found after Node.js installation"
  exit 1
fi
log "npm version: $(npm --version)"

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
  log "Installing PM2 process manager..."
  npm install -g pm2
  log "PM2 installed: $(pm2 --version)"
else
  log "PM2 already installed: $(pm2 --version)"
fi

# Verify all critical tools
log "Verifying installations..."
command -v node >/dev/null 2>&1 || { error "Node.js installation failed"; exit 1; }
command -v npm >/dev/null 2>&1 || { error "npm installation failed"; exit 1; }
command -v nginx >/dev/null 2>&1 || { error "nginx installation failed"; exit 1; }
command -v mysql >/dev/null 2>&1 || { error "MariaDB installation failed"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { error "PM2 installation failed"; exit 1; }

log "All system dependencies installed successfully!"
log "  - Node.js: $(node --version)"
log "  - npm: $(npm --version)"
log "  - PM2: $(pm2 --version)"
log "  - nginx: $(nginx -v 2>&1)"
log "  - MariaDB: $(mysql --version | head -n1)"
