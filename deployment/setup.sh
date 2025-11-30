#!/bin/bash
#
# Raspberry Pi IoT Monitoring Application - Automated Deployment Script
# Version: 1.0
# Description: One-command setup for Angular 19 + NestJS IoT monitoring app
#

set -e  # Exit on error
set -o pipefail  # Catch errors in pipes

# ================================
# Configuration
# ================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_PATH="${APP_ROOT}/frontend"
BACKEND_PATH="${APP_ROOT}/backend"
LOG_FILE="/var/log/iot-deployment.log"
STATE_FILE="${APP_ROOT}/.deployment-state"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Export functions for subscripts
export -f log error warning info
export RED GREEN YELLOW BLUE NC LOG_FILE

# Trap errors
trap 'error "Script failed at line $LINENO. Check $LOG_FILE for details."' ERR

# ================================
# Banner
# ================================
clear
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Raspberry Pi IoT Monitoring Application                ║
║   Automated Deployment Script v1.0                       ║
║                                                           ║
║   Angular 19 Frontend + NestJS Backend                   ║
║   MySQL Database + PM2 Process Manager                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo ""

# ================================
# Pre-flight Checks
# ================================
log "Running pre-flight checks..."

# Check root/sudo
if [ "$EUID" -ne 0 ]; then
  error "Please run as root or with sudo"
  error "Usage: sudo bash deployment/setup.sh"
  exit 1
fi

# Check Debian-based OS
if [ ! -f /etc/debian_version ]; then
  error "This script requires a Debian-based OS (Raspberry Pi OS)"
  exit 1
fi

# Check disk space
AVAILABLE_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 2 ]; then
  error "Insufficient disk space. At least 2GB required, ${AVAILABLE_SPACE}GB available"
  exit 1
fi

# Check internet connectivity
if ! ping -c 1 google.com &> /dev/null && ! ping -c 1 8.8.8.8 &> /dev/null; then
  warning "No internet connectivity detected. Installation may fail."
  read -p "Continue anyway? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check required directories
if [ ! -d "$FRONTEND_PATH" ]; then
  error "Frontend directory not found: $FRONTEND_PATH"
  exit 1
fi

if [ ! -d "$BACKEND_PATH" ]; then
  error "Backend directory not found: $BACKEND_PATH"
  exit 1
fi

log "Pre-flight checks passed ✓"
echo ""

# ================================
# Interactive Configuration
# ================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  CONFIGURATION                            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Get IP address
while true; do
  read -p "Enter the IP address for this Raspberry Pi [192.168.0.151]: " IP_ADDRESS
  IP_ADDRESS=${IP_ADDRESS:-192.168.0.151}

  # Validate IP format
  if [[ $IP_ADDRESS =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo ""
    echo "Configuration Summary:"
    echo "  - Backend API: http://${IP_ADDRESS}:3000"
    echo "  - Frontend:    http://${IP_ADDRESS}"
    echo "  - Database:    nest-nh3 (MySQL)"
    echo ""
    read -p "Is this correct? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      break
    fi
  else
    error "Invalid IP address format. Please try again."
  fi
done

# Generate MySQL root password
MYSQL_ROOT_PASS=$(openssl rand -base64 16 2>/dev/null || date +%s | sha256sum | base64 | head -c 16)
info "Generated MySQL root password (stored in /root/.mysql_deployment_credentials)"

# Check for existing installation
FORCE_FRONTEND_REBUILD=false
if [ -f "$STATE_FILE" ]; then
  warning "Existing deployment detected!"
  PREVIOUS_IP=$(grep "^INITIAL_IP_ADDRESS=" "$STATE_FILE" 2>/dev/null | cut -d= -f2)

  if [ -n "$PREVIOUS_IP" ] && [ "$PREVIOUS_IP" != "$IP_ADDRESS" ]; then
    info "IP address changed from $PREVIOUS_IP to $IP_ADDRESS"
    info "Will rebuild frontend with new configuration..."
    FORCE_FRONTEND_REBUILD=true
  else
    info "Re-running deployment (idempotent mode - already completed steps will be skipped)"
  fi
  echo ""
fi

# ================================
# Start Deployment
# ================================
echo ""
log "Starting deployment process..."
log "Application root: $APP_ROOT"
log "Log file: $LOG_FILE"
echo ""

# Export paths for subscripts
export APP_ROOT FRONTEND_PATH BACKEND_PATH STATE_FILE

# ================================
# Phase 1: Install Dependencies
# ================================
if ! grep -q "^SYSTEM_PACKAGES_INSTALLED=true" "$STATE_FILE" 2>/dev/null; then
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║  Phase 1/7: Installing System Dependencies                ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""

  source "${SCRIPT_DIR}/scripts/install-dependencies.sh"
  echo "SYSTEM_PACKAGES_INSTALLED=true" >> "$STATE_FILE"
  echo ""
else
  log "Phase 1/7: System dependencies already installed, skipping..."
  echo ""
fi

# ================================
# Phase 2: Setup Database
# ================================
if ! grep -q "^DATABASE_INITIALIZED=true" "$STATE_FILE" 2>/dev/null; then
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║  Phase 2/7: Setting Up Database                           ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""

  source "${SCRIPT_DIR}/scripts/setup-database.sh" "$MYSQL_ROOT_PASS"
  echo "DATABASE_INITIALIZED=true" >> "$STATE_FILE"
  echo ""
else
  log "Phase 2/7: Database already initialized, skipping..."
  echo ""
fi

# ================================
# Phase 3: Build Frontend
# ================================
if [ "$FORCE_FRONTEND_REBUILD" = true ] || ! grep -q "^FRONTEND_DEPLOYED=true" "$STATE_FILE" 2>/dev/null; then
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║  Phase 3/7: Building and Deploying Frontend              ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""

  source "${SCRIPT_DIR}/scripts/build-frontend.sh" "$IP_ADDRESS" "$FRONTEND_PATH"

  # Update state file
  if grep -q "^FRONTEND_DEPLOYED=" "$STATE_FILE" 2>/dev/null; then
    sed -i "s/^FRONTEND_DEPLOYED=.*/FRONTEND_DEPLOYED=true/" "$STATE_FILE"
  else
    echo "FRONTEND_DEPLOYED=true" >> "$STATE_FILE"
  fi
  echo ""
else
  log "Phase 3/7: Frontend already deployed, skipping..."
  echo ""
fi

# ================================
# Phase 4: Build Backend
# ================================
if ! grep -q "^BACKEND_BUILT=true" "$STATE_FILE" 2>/dev/null; then
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║  Phase 4/7: Building Backend                              ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""

  source "${SCRIPT_DIR}/scripts/build-backend.sh" "$BACKEND_PATH"
  echo "BACKEND_BUILT=true" >> "$STATE_FILE"
  echo ""
else
  log "Phase 4/7: Backend already built, skipping..."
  echo ""
fi

# ================================
# Phase 5: Configure Services
# ================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Phase 5/7: Configuring Services                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

source "${SCRIPT_DIR}/scripts/configure-services.sh" "$BACKEND_PATH" "$FRONTEND_PATH" "$IP_ADDRESS"

if grep -q "^SERVICES_CONFIGURED=" "$STATE_FILE" 2>/dev/null; then
  sed -i "s/^SERVICES_CONFIGURED=.*/SERVICES_CONFIGURED=true/" "$STATE_FILE"
else
  echo "SERVICES_CONFIGURED=true" >> "$STATE_FILE"
fi
echo ""

# ================================
# Phase 6: Validate Deployment
# ================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Phase 6/7: Validating Deployment                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

log "Waiting 5 seconds for services to stabilize..."
sleep 5

source "${SCRIPT_DIR}/scripts/validate-deployment.sh" "$BACKEND_PATH"
VALIDATION_RESULT=$?
echo ""

# ================================
# Phase 7: Finalize
# ================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Phase 7/7: Finalizing Deployment                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

log "Updating deployment state..."
if grep -q "^INITIAL_IP_ADDRESS=" "$STATE_FILE" 2>/dev/null; then
  sed -i "s/^INITIAL_IP_ADDRESS=.*/INITIAL_IP_ADDRESS=${IP_ADDRESS}/" "$STATE_FILE"
else
  echo "INITIAL_IP_ADDRESS=${IP_ADDRESS}" >> "$STATE_FILE"
fi

if grep -q "^DEPLOYMENT_DATE=" "$STATE_FILE" 2>/dev/null; then
  sed -i "s/^DEPLOYMENT_DATE=.*/DEPLOYMENT_DATE=$(date -Iseconds)/" "$STATE_FILE"
else
  echo "DEPLOYMENT_DATE=$(date -Iseconds)" >> "$STATE_FILE"
fi

# ================================
# Display Summary
# ================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           DEPLOYMENT COMPLETED SUCCESSFULLY               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "URLS:"
echo "  Frontend:  http://${IP_ADDRESS}"
echo "  Backend:   http://${IP_ADDRESS}:3000"
echo ""
echo "CREDENTIALS:"
echo "  Database User:     Sanyi@localhost"
echo "  Database Password: sakkiraly11"
echo "  Database Name:     nest-nh3"
echo ""
echo "SERVICES STATUS:"
systemctl is-active nginx &>/dev/null && echo "  ✓ Nginx:    [RUNNING]" || echo "  ✗ Nginx:    [STOPPED]"
systemctl is-active mariadb &>/dev/null && echo "  ✓ MariaDB:  [RUNNING]" || echo "  ✗ MariaDB:  [STOPPED]"
pm2 list | grep -q "iot-backend.*online" 2>/dev/null && echo "  ✓ Backend:  [RUNNING] (PM2: iot-backend)" || echo "  ✗ Backend:  [STOPPED]"
echo ""
echo "LOGS:"
echo "  Backend logs:    pm2 logs iot-backend"
echo "  Nginx logs:      /var/log/nginx/access.log"
echo "  Deployment log:  /var/log/iot-deployment.log"
echo ""
echo "NEXT STEPS:"
echo ""
echo "  1. ⚠️  IMPORTANT: Reboot the system for serial port access"
echo "     sudo reboot"
echo ""
echo "  2. Connect your USB serial devices (/dev/ttyUSB0, /dev/ttyUSB1)"
echo ""
echo "  3. Access the application:"
echo "     Frontend: http://${IP_ADDRESS}"
echo "     Backend:  http://${IP_ADDRESS}:3000"
echo ""
echo "USEFUL COMMANDS:"
echo "  Restart backend:  pm2 restart iot-backend"
echo "  Stop backend:     pm2 stop iot-backend"
echo "  View backend:     pm2 list"
echo "  Monitor backend:  pm2 monit"
echo "  Restart nginx:    sudo systemctl restart nginx"
echo "  View database:    mysql -u Sanyi -psakkiraly11 nest-nh3"
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo ""

if [ $VALIDATION_RESULT -eq 0 ]; then
  log "✓ All systems operational! Deployment successful!"
else
  warning "⚠ Some validation checks failed. Please review the output above."
  warning "The deployment may still work, but some features might not be available."
fi

log "Deployment complete! Check ${LOG_FILE} for details."
echo ""
