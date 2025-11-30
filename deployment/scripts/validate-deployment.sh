#!/bin/bash
#
# Validate deployment by checking all services and components
# Returns 0 if all checks pass, 1 if any check fails
#

set +e  # Don't exit on error, we want to run all checks

VALIDATION_FAILED=0
BACKEND_PATH=$1

# Helper function to run validation checks
validate() {
  local check_name=$1
  local command=$2

  if eval "$command" &> /dev/null; then
    echo -e "${GREEN}✓${NC} ${check_name}"
    return 0
  else
    echo -e "${RED}✗${NC} ${check_name}"
    VALIDATION_FAILED=1
    return 1
  fi
}

log "Running deployment validation..."
echo ""

# Service checks
log "Service Health Checks:"
validate "Nginx is running" "systemctl is-active nginx"
validate "MariaDB is running" "systemctl is-active mariadb"
validate "Backend is running (PM2)" "pm2 list | grep -q 'iot-backend.*online'"

echo ""

# File checks
log "File Deployment Checks:"
validate "Frontend index.html exists" "test -f /var/www/html/index.html"
validate "Frontend assets deployed" "test -d /var/www/html/assets || test -f /var/www/html/main*.js"
validate "Backend dist/main.js exists" "test -f ${BACKEND_PATH}/dist/main.js"
validate "Backend node_modules exists" "test -d ${BACKEND_PATH}/node_modules"
validate "Prisma client generated" "test -d ${BACKEND_PATH}/node_modules/.prisma/client || test -d ${BACKEND_PATH}/node_modules/@prisma/client"

echo ""

# Database checks
log "Database Checks:"
validate "Database is accessible" "mysql -u Sanyi -psakkiraly11 nest-nh3 -e 'SELECT 1;' 2>/dev/null"
validate "Database has tables" "[ \$(mysql -u Sanyi -psakkiraly11 nest-nh3 -N -e 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=\"nest-nh3\";' 2>/dev/null) -gt 0 ]"

echo ""

# Network checks
log "Network Checks:"
validate "Port 80 is listening" "ss -tlnp 2>/dev/null | grep -q ':80 ' || netstat -tlnp 2>/dev/null | grep -q ':80 '"
validate "Port 3000 is listening" "ss -tlnp 2>/dev/null | grep -q ':3000 ' || netstat -tlnp 2>/dev/null | grep -q ':3000 '"
validate "Port 3306 is listening (MySQL)" "ss -tlnp 2>/dev/null | grep -q ':3306 ' || netstat -tlnp 2>/dev/null | grep -q ':3306 '"

echo ""

# User permissions
log "Permission Checks:"
CURRENT_USER=${SUDO_USER:-${USER}}
if [ -n "$CURRENT_USER" ] && [ "$CURRENT_USER" != "root" ]; then
  validate "User '${CURRENT_USER}' in dialout group" "groups ${CURRENT_USER} | grep -q dialout"
else
  echo -e "${YELLOW}⚠${NC} Could not check dialout group (no non-root user detected)"
fi

echo ""

# HTTP endpoint checks
log "HTTP Endpoint Checks:"
validate "Frontend is accessible (HTTP 200)" "curl -s -o /dev/null -w '%{http_code}' http://localhost/ | grep -q '200'"
validate "Backend is responding" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ | grep -qE '(200|404)'"

echo ""

# Optional: Serial device check
log "Hardware Checks:"
if ls /dev/ttyUSB* &> /dev/null || ls /dev/ttyACM* &> /dev/null; then
  echo -e "${GREEN}✓${NC} Serial devices detected: $(ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null | tr '\n' ' ')"
else
  echo -e "${YELLOW}⚠${NC} No USB serial devices found (/dev/ttyUSB*, /dev/ttyACM*)"
  echo "  This is OK if devices are not yet connected"
fi

echo ""

# Summary
if [ $VALIDATION_FAILED -eq 0 ]; then
  log "All validation checks passed! ✓"
  echo ""
  return 0
else
  error "Some validation checks failed! ✗"
  error "Please review the output above and check the logs:"
  error "  - Backend logs: pm2 logs iot-backend"
  error "  - Nginx logs: /var/log/nginx/error.log"
  error "  - Deployment log: /var/log/iot-deployment.log"
  echo ""
  return 1
fi
