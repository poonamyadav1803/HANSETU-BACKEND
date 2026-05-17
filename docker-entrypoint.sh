#!/bin/sh
set -e

echo "Running migrations..."

node dist/db/migrations/create_new_tables.js
node dist/db/migrations/create_service_tables.js
node dist/db/migrations/create_gst_table.js

echo "Running seed..."
node dist/db/seeds/index.js

echo "Starting server..."
exec node dist/server.js