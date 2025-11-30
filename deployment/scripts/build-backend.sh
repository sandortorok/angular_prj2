#!/bin/bash
#
# Build NestJS backend application
# Installs dependencies, generates Prisma client, and builds application
#

set -e

BACKEND_PATH=$1

if [ -z "$BACKEND_PATH" ]; then
  error "Usage: build-backend.sh <backend_path>"
  exit 1
fi

if [ ! -d "$BACKEND_PATH" ]; then
  error "Backend path does not exist: $BACKEND_PATH"
  exit 1
fi

log "Building backend..."

cd "${BACKEND_PATH}"

# Verify .env file exists
if [ ! -f .env ]; then
  warning ".env file not found, creating from template..."
  cat > .env << 'EOF'
DATABASE_URL="mysql://Sanyi:sakkiraly11@localhost:3306/nest-nh3"
EOF
  log ".env file created"
else
  log ".env file exists"
fi

# Install dependencies
log "Installing backend dependencies..."
log "This may take several minutes, especially for native modules like serialport..."
npm ci --prefer-offline --no-audit

# Generate Prisma client
log "Generating Prisma client..."
npx prisma generate

# Build NestJS application
log "Building NestJS application..."
npm run build

# Verify build output
if [ ! -f dist/main.js ]; then
  error "Build failed: dist/main.js not found"
  exit 1
fi

log "Backend build complete!"
log "Build output: ${BACKEND_PATH}/dist/main.js"

# Add current user to dialout group for serial port access
CURRENT_USER=${SUDO_USER:-${USER}}
if [ -n "$CURRENT_USER" ] && [ "$CURRENT_USER" != "root" ]; then
  log "Adding user '${CURRENT_USER}' to 'dialout' group for serial port access..."
  usermod -a -G dialout "${CURRENT_USER}" 2>/dev/null || true
  log "User added to dialout group (reboot required for changes to take effect)"
else
  warning "Could not determine non-root user, skipping dialout group setup"
fi
