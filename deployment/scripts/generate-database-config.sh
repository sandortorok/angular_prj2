#!/bin/bash
#
# Generate custom database configuration based on user input
# Creates SQL file with panels and sensors
#

set -e

APP_NAME=$1
PANEL_COUNT=$2
SENSORS_PER_PANEL=$3
OUTPUT_FILE=$4

if [ -z "$APP_NAME" ] || [ -z "$PANEL_COUNT" ] || [ -z "$SENSORS_PER_PANEL" ] || [ -z "$OUTPUT_FILE" ]; then
  error "Usage: generate-database-config.sh <app_name> <panel_count> <sensors_per_panel> <output_file>"
  exit 1
fi

log "Generating database configuration..."
log "  Application name: ${APP_NAME}"
log "  Panel count: ${PANEL_COUNT}"
log "  Sensors per panel: ${SENSORS_PER_PANEL}"

# Create SQL file
cat > "$OUTPUT_FILE" << 'EOF'
-- Custom Generated Database Configuration

-- Clear existing data (respecting foreign key constraints)
-- Delete in correct order: child tables first, then parents
DELETE FROM SensorHistory;  -- References Sensor
DELETE FROM Siren;          -- References Panel
DELETE FROM Sensor;         -- References Panel
DELETE FROM Panel;          -- No dependencies

-- Reset auto-increment
ALTER TABLE SensorHistory AUTO_INCREMENT = 1;
ALTER TABLE Siren AUTO_INCREMENT = 1;
ALTER TABLE Sensor AUTO_INCREMENT = 1;
ALTER TABLE Panel AUTO_INCREMENT = 1;

EOF

# Generate Panel inserts
log "Generating Panel configuration..."
echo "-- Insert Panels" >> "$OUTPUT_FILE"
echo "INSERT INTO \`Panel\` (\`id\`, \`path\`, \`address\`, \`name\`) VALUES" >> "$OUTPUT_FILE"

PANEL_VALUES=""
for ((i=1; i<=PANEL_COUNT; i++)); do
  PANEL_NAME="Panel ${i}"
  PANEL_ADDRESS=$i

  if [ $i -eq $PANEL_COUNT ]; then
    # Last panel - no comma
    PANEL_VALUES="${PANEL_VALUES}(${i}, '', ${PANEL_ADDRESS}, '${PANEL_NAME}');"
  else
    PANEL_VALUES="${PANEL_VALUES}(${i}, '', ${PANEL_ADDRESS}, '${PANEL_NAME}'),\n"
  fi
done

echo -e "$PANEL_VALUES" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Generate Sensor inserts
log "Generating Sensor configuration (${SENSORS_PER_PANEL} sensors per panel)..."
echo "-- Insert Sensors" >> "$OUTPUT_FILE"
echo "INSERT INTO \`Sensor\` (\`id\`, \`name\`, \`horn\`, \`address\`, \`panelId\`) VALUES" >> "$OUTPUT_FILE"

SENSOR_ID=1
SENSOR_VALUES=""
TOTAL_SENSORS=$((PANEL_COUNT * SENSORS_PER_PANEL))

for ((panel_id=1; panel_id<=PANEL_COUNT; panel_id++)); do
  for ((sensor_addr=1; sensor_addr<=SENSORS_PER_PANEL; sensor_addr++)); do
    SENSOR_NAME="Sensor ${sensor_addr}"

    if [ $SENSOR_ID -eq $TOTAL_SENSORS ]; then
      # Last sensor - no comma
      SENSOR_VALUES="${SENSOR_VALUES}(${SENSOR_ID}, '${SENSOR_NAME}', 0, ${sensor_addr}, ${panel_id});"
    else
      SENSOR_VALUES="${SENSOR_VALUES}(${SENSOR_ID}, '${SENSOR_NAME}', 0, ${sensor_addr}, ${panel_id}),\n"
    fi

    SENSOR_ID=$((SENSOR_ID + 1))
  done
done

echo -e "$SENSOR_VALUES" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log "Database configuration generated: ${OUTPUT_FILE}"
log "  Total panels: ${PANEL_COUNT}"
log "  Total sensors: ${TOTAL_SENSORS} (${SENSORS_PER_PANEL} per panel)"
