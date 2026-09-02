#!/usr/bin/env bash
# ==============================================================================
# HAFROSE Backend — Automated Backup Execution Script
# ==============================================================================
# Target OS: Ubuntu 24.04 LTS
# Usage: ./backup.sh [--dry-run|--force]
# Features: Database Backup, Storage Archive, Retention Rotation, Log Verification
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/hafrose/backend"
EXTRA_FLAGS="${*:-}"

# Color Codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO] Starting HAFROSE automated backup execution...${NC}"

if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
fi

if ! command -v php &>/dev/null; then
    echo -e "${RED}[ERROR] PHP binary not found in system PATH.${NC}"
    exit 1
fi

# Run custom artisan backup command (direct or via docker)
if command -v docker &>/dev/null && docker ps -q -f name=hafrose_backend 2>/dev/null | grep -q .; then
    echo -e "${BLUE}[INFO] Running backup inside hafrose_backend container...${NC}"
    docker exec hafrose_backend php artisan hafrose:backup --detailed $EXTRA_FLAGS
elif php artisan hafrose:backup --detailed $EXTRA_FLAGS; then
    echo -e "${GREEN}[SUCCESS] Production backup completed and verified successfully.${NC}"
    exit 0
else
    echo -e "${RED}[ERROR] Backup execution failed! Check storage/logs/laravel.log for stacktrace.${NC}"
    exit 1
fi

