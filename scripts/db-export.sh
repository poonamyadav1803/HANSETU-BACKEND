#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# db-export.sh — Export Hansetu database to a portable SQL dump
#
# Usage:
#   npm run db:export
#   # or directly:
#   SOURCE_DB_URL="postgresql://..." bash scripts/db-export.sh
#
# Output:
#   backups/hansetu_<timestamp>.sql  — full schema + data dump
#   backups/hansetu_<timestamp>_data_only.sql — data only (for migrating to
#     a provider where schema is already applied via Drizzle)
#
# Requirements: pg_dump must be installed (comes with PostgreSQL client tools)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DB_URL="${SOURCE_DB_URL:-${DATABASE_URL:-}}"

if [ -z "$DB_URL" ]; then
  # Load from .env if available
  if [ -f "$(dirname "$0")/../.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
    DB_URL="${DATABASE_URL:-}"
  fi
fi

if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL or SOURCE_DB_URL must be set."
  echo "Usage: SOURCE_DB_URL='postgresql://...' bash scripts/db-export.sh"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$(dirname "$0")/../backups"
mkdir -p "$BACKUP_DIR"

FULL_DUMP="$BACKUP_DIR/hansetu_${TIMESTAMP}.sql"
DATA_DUMP="$BACKUP_DIR/hansetu_${TIMESTAMP}_data_only.sql"

echo "[export] Exporting full schema + data..."
pg_dump \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --format=plain \
  --verbose \
  "$DB_URL" \
  > "$FULL_DUMP"

echo "[export] Exporting data only (for provider migration)..."
pg_dump \
  --no-owner \
  --no-acl \
  --data-only \
  --format=plain \
  --disable-triggers \
  --verbose \
  "$DB_URL" \
  > "$DATA_DUMP"

echo ""
echo "═══════════════════════════════════════════"
echo "  Export complete!"
echo "  Full dump : $FULL_DUMP"
echo "  Data only : $DATA_DUMP"
echo "═══════════════════════════════════════════"
