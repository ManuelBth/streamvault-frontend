#!/bin/sh
set -e

# Generate runtime config.json from environment variables
CONFIG_FILE="/usr/share/nginx/html/config.json"

echo "Generating runtime configuration..."

# Default values
API_URL="${API_URL:-http://localhost:8080/api/v1}"
WS_URL="${WS_URL:-ws://localhost:8080/ws}"
MINIO_URL="${MINIO_URL:-http://localhost:9000}"

# Generate config.json
cat > "$CONFIG_FILE" << EOF
{
  "apiUrl": "$API_URL",
  "wsUrl": "$WS_URL",
  "minioUrl": "$MINIO_URL"
}
EOF

echo "Configuration generated:"
cat "$CONFIG_FILE"

# Execute main command
exec "$@"
