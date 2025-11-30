#!/bin/bash
#
# Configure system services (Nginx, PM2, systemd)
# Sets up web server, process manager, and auto-start
#

set -e

BACKEND_PATH=$1
FRONTEND_PATH=$2
IP_ADDRESS=$3

if [ -z "$BACKEND_PATH" ] || [ -z "$FRONTEND_PATH" ] || [ -z "$IP_ADDRESS" ]; then
  error "Usage: configure-services.sh <backend_path> <frontend_path> <ip_address>"
  exit 1
fi

log "Configuring services..."

# Get frontend build output path
BUILD_OUTPUT="dist/frontend/browser"
if [ -f /tmp/frontend-build-output.txt ]; then
  BUILD_OUTPUT=$(cat /tmp/frontend-build-output.txt)
fi

# ================================
# Configure Nginx
# ================================
log "Configuring Nginx web server..."

cat > /etc/nginx/sites-available/iot-monitoring << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /var/www/html;
    index index.html;

    # Frontend static files - Angular routing support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket support for Socket.io
    location /socket.io {
        proxy_pass http://localhost:3000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Optional: Proxy API calls to backend
    # Uncomment if you want to access backend through same domain
    # location /api {
    #     proxy_pass http://localhost:3000;
    #     proxy_http_version 1.1;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/iot-monitoring /etc/nginx/sites-enabled/iot-monitoring

# Remove default site
if [ -f /etc/nginx/sites-enabled/default ]; then
  log "Removing default nginx site..."
  rm -f /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
log "Testing nginx configuration..."
if ! nginx -t; then
  error "Nginx configuration test failed"
  exit 1
fi

# Deploy frontend files
log "Deploying frontend to /var/www/html..."
rm -rf /var/www/html/*
cp -r "${FRONTEND_PATH}/${BUILD_OUTPUT}/"* /var/www/html/
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Restart and enable nginx
log "Restarting nginx..."
systemctl restart nginx
systemctl enable nginx

log "Nginx configured and running"

# ================================
# Configure PM2
# ================================
log "Configuring PM2 process manager..."

# Create PM2 ecosystem file
cat > "${BACKEND_PATH}/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'iot-backend',
    script: './dist/main.js',
    cwd: '${BACKEND_PATH}',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      TZ: 'Europe/Amsterdam'
    },
    error_file: '/var/log/pm2/iot-backend-error.log',
    out_file: '/var/log/pm2/iot-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Create PM2 log directory
mkdir -p /var/log/pm2
CURRENT_USER=${SUDO_USER:-${USER}}
if [ -n "$CURRENT_USER" ] && [ "$CURRENT_USER" != "root" ]; then
  chown -R "${CURRENT_USER}:${CURRENT_USER}" /var/log/pm2
fi

# Stop existing PM2 process if running
pm2 delete iot-backend 2>/dev/null || true

# Start backend with PM2
log "Starting backend with PM2..."
cd "${BACKEND_PATH}"
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script for systemd
log "Configuring PM2 to start on boot..."
if [ -n "$CURRENT_USER" ] && [ "$CURRENT_USER" != "root" ]; then
  # Generate startup script for non-root user
  STARTUP_CMD=$(pm2 startup systemd -u "${CURRENT_USER}" --hp "/home/${CURRENT_USER}" | grep "sudo env")
  if [ -n "$STARTUP_CMD" ]; then
    eval "$STARTUP_CMD"
  fi
else
  pm2 startup systemd
fi

log "PM2 configured and running"

# ================================
# Enable MariaDB auto-start
# ================================
log "Enabling MariaDB to start on boot..."
systemctl enable mariadb

# ================================
# Summary
# ================================
log "Service configuration complete!"
log "  - Nginx: Running on port 80"
log "  - Backend (PM2): Running on port 3000"
log "  - MariaDB: Running on port 3306"
log ""
log "Service status:"
systemctl is-active nginx && log "  ✓ Nginx is active" || warning "  ✗ Nginx is not active"
systemctl is-active mariadb && log "  ✓ MariaDB is active" || warning "  ✗ MariaDB is not active"
pm2 list | grep -q "iot-backend.*online" && log "  ✓ Backend (PM2) is online" || warning "  ✗ Backend is not online"
