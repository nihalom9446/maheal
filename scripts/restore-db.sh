#!/usr/bin/env bash
# ==============================================================================
# MAHEALL Platform - Database Restore Script
# Restores PostgreSQL database from compressed backup file with checksum verification
# ==============================================================================

set -euo pipefail

CONTAINER_NAME="${DB_CONTAINER:-maheall-prod-db}"
DB_NAME="${POSTGRES_DB:-maheall}"
DB_USER="${POSTGRES_USER:-maheall_admin}"

usage() {
    echo "Usage: $0 [-f|--force] <path-to-backup-file.sql.gz>"
    echo "Example: $0 /var/backups/maheall/maheall_db_20260908_180000.sql.gz"
    exit 1
}

FORCE=0
BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -f|--force)
            FORCE=1
            shift
            ;;
        *)
            if [ -z "${BACKUP_FILE}" ]; then
                BACKUP_FILE="$1"
                shift
            else
                usage
            fi
            ;;
    esac
done

if [ -z "${BACKUP_FILE}" ]; then
    usage
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "================================================================="
echo "MAHEALL Platform - Database Restore Tool"
echo "Target Database: ${DB_NAME}"
echo "Target User:     ${DB_USER}"
echo "Backup File:     ${BACKUP_FILE}"
echo "================================================================="

# Checksum verification if .sha256 file exists
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
    echo "Verifying SHA256 checksum..."
    if sha256sum -c "${CHECKSUM_FILE}"; then
        echo "Checksum verified successfully."
    else
        echo "ERROR: Checksum mismatch! The backup file may be corrupted."
        exit 1
    fi
fi

# Confirmation prompt if not forced
if [ "${FORCE}" -ne 1 ]; then
    read -rp "WARNING: This will overwrite current data in '${DB_NAME}'. Proceed? [y/N]: " CONFIRM
    if [[ ! "${CONFIRM}" =~ ^[yY]([eE][sS])?$ ]]; then
        echo "Restore cancelled by user."
        exit 0
    fi
fi

echo "Starting restoration from ${BACKUP_FILE}..."

# Restore via Docker container or local psql
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Restoring to Docker container: ${CONTAINER_NAME}"
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"
else
    echo "Restoring to local PostgreSQL instance"
    gunzip -c "${BACKUP_FILE}" | psql -U "${DB_USER}" -d "${DB_NAME}"
fi

echo "Verifying restored tables in '${DB_NAME}'..."
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker exec -t "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "\dt"
fi

echo "Database restoration completed successfully!"
