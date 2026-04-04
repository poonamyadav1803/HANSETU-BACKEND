#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# db-import.sh — Import a SQL dump into a target PostgreSQL database
#
# Usage:
#   TARGET_DB_URL="postgresql://..." DUMP_FILE="backups/hansetu_xyz.sql" \
#     bash scripts/db-import.sh
#
# Or for full migration flow:
#   1. npm run db:export               (export from Neon → backups/)
#   2. npm run db:migrate              (apply Drizzle schema to TARGET)
#   3. DUMP_FILE=backups/hansetu_xxx_data_only.sql \
#      TARGET_DB_URL=<aws-rds-url> npm run db:import
#
# Requirements: psql must be installed (comes with PostgreSQL client tools)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

TARGET_URL="${TARGET_DB_URL:-}"
DUMP_FILE="${DUMP_FILE:-}"

# Load .env as fallback
if [ -z "$TARGET_URL" ] && [ -f "$(dirname "$0")/../.env" ]; then
  export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
  TARGET_URL="${DATABASE_URL:-}"
fi

if [ -z "$TARGET_URL" ]; then
  echo "ERROR: TARGET_DB_URL must be set."
  echo "Usage: TARGET_DB_URL='postgresql://...' DUMP_FILE='backups/xxx.sql' bash scripts/db-import.sh"
  exit 1
fi

if [ -z "$DUMP_FILE" ]; then
  echo "ERROR: DUMP_FILE must be set."
  echo "Usage: TARGET_DB_URL='...' DUMP_FILE='backups/hansetu_xxx.sql' bash scripts/db-import.sh"
  exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "ERROR: Dump file not found: $DUMP_FILE"
  exit 1
fi

echo "[import] Importing $DUMP_FILE into target database..."
echo "[import] Target: ${TARGET_URL%%@*}@..."  # mask credentials in log

psql \
  --no-password \
  --single-transaction \
  --set ON_ERROR_STOP=on \
  "$TARGET_URL" \
  < "$DUMP_FILE"

echo ""
echo "═══════════════════════════════════════════"
echo "  Import complete!"
echo "  File: $DUMP_FILE"
echo "═══════════════════════════════════════════"
