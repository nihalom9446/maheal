#!/usr/bin/env bash
# ==============================================================================
# MAHEALL Platform - Automated Database Backup Script
# PostgreSQL pg_dump with gzip compression, checksum generation, and retention cleanup
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/maheall}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="${DB_CONTAINER:-maheall-prod-db}"
DB_NAME="${POSTGRES_DB:-maheall}"
DB_USER="${POSTGRES_USER:-maheall_admin}"

BACKUP_FILE="${BACKUP_DIR}/maheall_db_${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

log() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" | tee -a "${LOG_FILE}"
}

log "Starting database backup for '${DB_NAME}'..."

# Execute pg_dump from Docker container or localhost
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log "Dumping from Docker container: ${CONTAINER_NAME}"
    docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILE}"
else
    log "Dumping from local PostgreSQL instance"
    pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILE}"
fi

# Verify backup file size
if [ ! -s "${BACKUP_FILE}" ]; then
    log "ERROR: Backup file is empty or missing: ${BACKUP_FILE}"
    exit 1
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log "Backup generated successfully: ${BACKUP_FILE} (Size: ${FILE_SIZE})"

# Generate SHA256 checksum
sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
log "Checksum generated: ${CHECKSUM_FILE}"

# Retention Cleanup: Remove backups older than RETENTION_DAYS
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "${BACKUP_DIR}" -type f -name "maheall_db_*.sql.gz*" -mtime +"${RETENTION_DAYS}" -delete -print | wc -l)
log "Cleanup finished. Removed ${DELETED_COUNT} expired files."

log "Backup process completed successfully."
