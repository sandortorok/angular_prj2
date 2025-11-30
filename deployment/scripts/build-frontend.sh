#!/bin/bash
#
# Build Angular frontend with configured IP address
# Updates environment.ts and builds production bundle
#

set -e

IP_ADDRESS=$1
FRONTEND_PATH=$2

if [ -z "$IP_ADDRESS" ] || [ -z "$FRONTEND_PATH" ]; then
  error "Usage: build-frontend.sh <ip_address> <frontend_path>"
  exit 1
fi

if [ ! -d "$FRONTEND_PATH" ]; then
  error "Frontend path does not exist: $FRONTEND_PATH"
  exit 1
fi

log "Building frontend with IP: ${IP_ADDRESS}..."

cd "${FRONTEND_PATH}"

# Backup original environment file (only once)
if [ ! -f src/environments/environment.ts.original ]; then
  log "Backing up original environment.ts..."
  cp src/environments/environment.ts src/environments/environment.ts.original
fi

# Update environment.ts with new IP address
log "Updating environment.ts with backend URL: http://${IP_ADDRESS}:3000"
cat > src/environments/environment.ts << EOF
export const environment = {
  backend_url: 'http://${IP_ADDRESS}:3000',
  production: true,
};
EOF

# Update application name in source files (before build)
if [ -n "$APP_NAME" ]; then
  log "Updating application name to: ${APP_NAME}"

  # Backup original files (only once)
  if [ ! -f src/index.html.original ]; then
    cp src/index.html src/index.html.original
  fi
  if [ ! -f src/app/sidenav/sidenav.component.html.original ]; then
    cp src/app/sidenav/sidenav.component.html src/app/sidenav/sidenav.component.html.original
  fi

  # Update index.html title
  sed -i "s|<title>.*</title>|<title>${APP_NAME}</title>|" src/index.html

  # Update sidenav header (replace "Panír 3 Ammónia Érzékelők" or similar)
  # This will replace any <h2> content in sidenav with the app name
  sed -i "s|<h2>.*Érzékelők</h2>|<h2>${APP_NAME} Érzékelők</h2>|" src/app/sidenav/sidenav.component.html
fi

# Install dependencies
log "Installing frontend dependencies..."
log "This may take several minutes on Raspberry Pi..."
npm ci --prefer-offline --no-audit

# Build production bundle
log "Building production bundle..."
log "This may take 5-10 minutes on Raspberry Pi..."
npm run build

# Verify build output (Angular 19 uses dist/frontend/browser)
if [ ! -d dist/frontend/browser ]; then
  # Try old Angular structure
  if [ ! -d dist/frontend ]; then
    error "Build failed: dist/frontend directory not found"
    exit 1
  fi
  warning "Using older Angular output structure (dist/frontend instead of dist/frontend/browser)"
  BUILD_OUTPUT="dist/frontend"
else
  BUILD_OUTPUT="dist/frontend/browser"
fi

if [ ! -f "${BUILD_OUTPUT}/index.html" ]; then
  error "Build failed: index.html not found in ${BUILD_OUTPUT}"
  exit 1
fi

log "Frontend build complete!"
log "Build output location: ${FRONTEND_PATH}/${BUILD_OUTPUT}"

# Store build output path for later use
echo "${BUILD_OUTPUT}" > /tmp/frontend-build-output.txt
