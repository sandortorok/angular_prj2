#!/bin/bash
#
# Setup MySQL database for IoT Monitoring Application
# Creates database user, database, and imports dump.sql
#

set -e

MYSQL_ROOT_PASS=$1
DB_NAME="nest-nh3"
DB_USER="Sanyi"
DB_PASS="sakkiraly11"

if [ -z "$MYSQL_ROOT_PASS" ]; then
  error "MySQL root password not provided"
  exit 1
fi

log "Setting up MySQL database..."

# Secure MySQL installation (non-interactive)
if [ ! -f /root/.mysql_deployment_credentials ]; then
  log "Securing MariaDB installation..."

  # Set root password
  mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASS}';" 2>/dev/null || \
    mysql -e "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${MYSQL_ROOT_PASS}');" 2>/dev/null || \
    mysqladmin -u root password "${MYSQL_ROOT_PASS}" 2>/dev/null

  # Remove anonymous users
  mysql -u root -p"${MYSQL_ROOT_PASS}" -e "DELETE FROM mysql.user WHERE User='';" 2>/dev/null || true

  # Remove remote root login
  mysql -u root -p"${MYSQL_ROOT_PASS}" -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');" 2>/dev/null || true

  # Remove test database
  mysql -u root -p"${MYSQL_ROOT_PASS}" -e "DROP DATABASE IF EXISTS test;" 2>/dev/null || true
  mysql -u root -p"${MYSQL_ROOT_PASS}" -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';" 2>/dev/null || true

  # Flush privileges
  mysql -u root -p"${MYSQL_ROOT_PASS}" -e "FLUSH PRIVILEGES;"

  # Save root password
  echo "${MYSQL_ROOT_PASS}" > /root/.mysql_deployment_credentials
  chmod 600 /root/.mysql_deployment_credentials
  log "MariaDB secured successfully"
else
  log "MariaDB already secured (credentials file exists)"
fi

# Create database user
log "Creating database user '${DB_USER}@localhost'..."
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';" 2>/dev/null || true
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "FLUSH PRIVILEGES;"
log "Database user created successfully"

# Create database
log "Creating database '${DB_NAME}'..."
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
log "Database created successfully"

# Import base schema (structure only)
if [ -f "${BACKEND_PATH}/dumps/dump.sql" ]; then
  log "Importing base database schema..."
  # Import only the structure (CREATE TABLE statements)
  mysql -u root -p"${MYSQL_ROOT_PASS}" "${DB_NAME}" < "${BACKEND_PATH}/dumps/dump.sql"
  log "Base schema imported successfully"
else
  warning "Database dump not found at ${BACKEND_PATH}/dumps/dump.sql, skipping import"
fi

# Generate and import custom configuration
if [ -n "$PANEL_COUNT" ] && [ -n "$SENSORS_PER_PANEL" ]; then
  log "Generating custom database configuration..."
  CUSTOM_SQL_FILE="/tmp/custom-db-config.sql"

  # Source the generate script
  source "$(dirname "$0")/generate-database-config.sh" "$APP_NAME" "$PANEL_COUNT" "$SENSORS_PER_PANEL" "$CUSTOM_SQL_FILE"

  log "Importing custom configuration..."
  mysql -u root -p"${MYSQL_ROOT_PASS}" "${DB_NAME}" < "$CUSTOM_SQL_FILE"

  # Cleanup
  rm -f "$CUSTOM_SQL_FILE"

  log "Custom database configuration imported successfully"
else
  warning "Panel/Sensor configuration not provided, using default dump data"
fi

# Verify database setup
log "Verifying database setup..."
TABLE_COUNT=$(mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null)
log "Database '${DB_NAME}' has ${TABLE_COUNT} tables"

if [ "$TABLE_COUNT" -gt 0 ]; then
  log "Tables in database:"
  mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" -e "SHOW TABLES;" 2>/dev/null | tail -n +2 | while read table; do
    log "  - ${table}"
  done
fi

log "Database setup complete!"
