#!/bin/sh
set -e

echo "Running DB migrations..."

node dist/db/migrations/create_new_tables.js
node dist/db/migrations/create_service_tables.js
node dist/db/migrations/create_gst_table.js

echo "Running DB seed..."
npm run db:seed

echo "Starting server..."
exec node dist/server.js