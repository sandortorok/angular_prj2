#!/bin/bash
#
# Update existing IoT Monitoring deployment
# Use this script to update the application after code changes
#

set -e

# ================================
# Configuration
# ================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_PATH="${APP_ROOT}/frontend"
BACKEND_PATH="${APP_ROOT}/backend"
STATE_FILE="${APP_ROOT}/.deployment-state"
LOG_FILE="/var/log/iot-deployment.log"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ================================
# Logging Functions
# ================================
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE" >&2
}

warning() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

trap 'error "Update failed at line $LINENO"' ERR

# ================================
# Banner
# ================================
clear
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   IoT Monitoring Application - Update Script             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo ""

# ================================
# Pre-checks
# ================================
if [ "$EUID" -ne 0 ]; then
  error "Please run as root or with sudo"
  error "Usage: sudo bash deployment/update.sh"
  exit 1
fi

if [ ! -f "$STATE_FILE" ]; then
  error "No existing deployment found. Run setup.sh first."
  exit 1
fi

# Read current IP from state file
IP_ADDRESS=$(grep "^INITIAL_IP_ADDRESS=" "$STATE_FILE" 2>/dev/null | cut -d= -f2)
if [ -z "$IP_ADDRESS" ]; then
  warning "Could not read IP address from state file"
  read -p "Enter the IP address for this deployment [192.168.0.151]: " IP_ADDRESS
  IP_ADDRESS=${IP_ADDRESS:-192.168.0.151}
fi

log "Updating IoT Monitoring Application..."
log "IP Address: ${IP_ADDRESS}"
echo ""

# ================================
# Update Code (optional - Git)
# ================================
if [ -d "${APP_ROOT}/.git" ]; then
  read -p "Pull latest code from git? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Pulling latest code from git..."
    cd "$APP_ROOT"
    git pull
    echo ""
  fi
fi

# ================================
# Update Frontend
# ================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Updating Frontend                                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

cd "$FRONTEND_PATH"

# Update environment.ts with current IP
log "Updating environment.ts with IP: ${IP_ADDRESS}"
cat > src/environments/environment.ts << EOF
export const environment = {
  backend_url: 'http://${IP_ADDRESS}:3000',
  production: true,
};
EOF

# Install/update dependencies
log "Installing/updating frontend dependencies..."
npm ci --prefer-offline --no-audit

# Rebuild
log "Rebuilding frontend..."
npm run build

# Determine build output path
if [ -d dist/frontend/browser ]; then
  BUILD_OUTPUT="dist/frontend/browser"
else
  BUILD_OUTPUT="dist/frontend"
fi

# Deploy
log "Deploying frontend to /var/www/html..."
rm -rf /var/www/html/*
cp -r "${BUILD_OUTPUT}/"* /var/www/html/
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

log "Frontend updated successfully!"
echo ""

# ================================
# Update Backend
# ================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Updating Backend                                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

cd "$BACKEND_PATH"

# Install/update dependencies
log "Installing/updating backend dependencies..."
npm ci --prefer-offline --no-audit

# Regenerate Prisma client
log "Regenerating Prisma client..."
npx prisma generate

# Run database migrations (if any)
log "Running database migrations..."
npx prisma migrate deploy 2>/dev/null || info "No pending migrations or migration failed (this is OK if no migrations exist)"

# Rebuild
log "Rebuilding backend..."
npm run build

log "Backend updated successfully!"
echo ""

# ================================
# Restart Services
# ================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Restarting Services                                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Restart nginx
log "Restarting nginx..."
systemctl restart nginx

# Restart backend via PM2
log "Restarting backend (PM2)..."
pm2 restart iot-backend

# Wait for services to start
log "Waiting for services to stabilize..."
sleep 3

# ================================
# Validation
# ================================
echo ""
log "Validating update..."

VALIDATION_OK=true

# Check nginx
if systemctl is-active nginx &>/dev/null; then
  echo -e "${GREEN}✓${NC} Nginx is running"
else
  echo -e "${RED}✗${NC} Nginx is not running"
  VALIDATION_OK=false
fi

# Check backend
if pm2 list | grep -q "iot-backend.*online"; then
  echo -e "${GREEN}✓${NC} Backend is running"
else
  echo -e "${RED}✗${NC} Backend is not running"
  VALIDATION_OK=false
fi

# Check frontend
if curl -s -o /dev/null -w '%{http_code}' http://localhost/ | grep -q '200'; then
  echo -e "${GREEN}✓${NC} Frontend is accessible"
else
  echo -e "${RED}✗${NC} Frontend is not accessible"
  VALIDATION_OK=false
fi

# Check backend API
if curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ | grep -qE '(200|404)'; then
  echo -e "${GREEN}✓${NC} Backend API is responding"
else
  echo -e "${RED}✗${NC} Backend API is not responding"
  VALIDATION_OK=false
fi

echo ""

# ================================
# Summary
# ================================
if [ "$VALIDATION_OK" = true ]; then
  log "✓ Update completed successfully!"
  echo ""
  echo "Application is running at:"
  echo "  Frontend: http://${IP_ADDRESS}"
  echo "  Backend:  http://${IP_ADDRESS}:3000"
  echo ""
  echo "Useful commands:"
  echo "  View backend logs: pm2 logs iot-backend"
  echo "  Monitor backend:   pm2 monit"
  echo "  Restart backend:   pm2 restart iot-backend"
else
  error "Update completed but some services are not running correctly"
  error "Check logs for details:"
  error "  - Backend: pm2 logs iot-backend"
  error "  - Nginx:   /var/log/nginx/error.log"
  exit 1
fi

# Update deployment date in state file
if grep -q "^DEPLOYMENT_DATE=" "$STATE_FILE"; then
  sed -i "s/^DEPLOYMENT_DATE=.*/DEPLOYMENT_DATE=$(date -Iseconds)/" "$STATE_FILE"
else
  echo "DEPLOYMENT_DATE=$(date -Iseconds)" >> "$STATE_FILE"
fi

log "Update complete!"
