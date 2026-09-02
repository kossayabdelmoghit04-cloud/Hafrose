#!/usr/bin/env bash
# ==============================================================================
# ⚠️  LEGACY SCRIPT — NOT FOR USE WITH DOCKER PRODUCTION STACK ⚠️
# ==============================================================================
# This script was designed for a bare-metal PHP-FPM setup (php8.3-fpm via
# systemd). HAFROSE rollback is now managed by the CI/CD workflow:
#   .github/workflows/ci-cd.yml  →  trap ERR handler
#   via: git checkout -f $PREV_COMMIT + docker compose up -d
#
# DO NOT run this script on the production Docker server.
# It is kept for historical reference only.
# ==============================================================================
# HAFROSE Backend — Automated Rollback Script (BARE-METAL LEGACY)
# ==============================================================================
# Target OS: Ubuntu 24.04 LTS (bare-metal, no Docker)
# Usage: ./rollback.sh [target_commit_or_tag]
# Features: Git Hard Reset, Re-installation, Cache Flush, Service Restarts, Recovery Verification
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/hafrose/backend"
TARGET_REF="${1:-HEAD@{1}}"
PHP_SERVICE="php8.3-fpm"
NGINX_SERVICE="nginx"
SUPERVISOR_WORKER="hafrose-worker:*"

# Color Codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO] ${NC}$1"; }
log_success() { echo -e "${GREEN}[SUCCESS] ${NC}$1"; }
log_warn()    { echo -e "${YELLOW}[WARN] ${NC}$1"; }
log_error()   { echo -e "${RED}[ERROR] ${NC}$1"; }

log_info "Initiating HAFROSE system rollback to target ref: $TARGET_REF..."

if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory $APP_DIR does not exist."
    exit 1
fi

cd "$APP_DIR"

# Step 1: Ensure Maintenance Mode is active during rollback
log_info "Ensuring application maintenance mode is active..."
php artisan down || true

# Step 2: Revert Git repository state
log_info "Reverting Git working directory to $TARGET_REF..."
git reset --hard "$TARGET_REF"
git clean -fd

CURRENT_COMMIT=$(git rev-parse HEAD)
log_warn "Repository rolled back to commit: $CURRENT_COMMIT"

# Step 3: Re-install target Composer dependencies
log_info "Re-installing PHP dependencies for target release..."
composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-ansi

# Step 4: Re-optimize caches
log_info "Flushing and rebuilding application caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

# Step 5: Fix permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Step 6: Restart workers and services
log_info "Restarting background workers and web servers..."
php artisan queue:restart

if command -v supervisorctl &>/dev/null; then
    supervisorctl restart "$SUPERVISOR_WORKER" || true
fi

if command -v systemctl &>/dev/null; then
    systemctl reload "$PHP_SERVICE" || true
    systemctl reload "$NGINX_SERVICE" || true
fi

# Step 7: Restore site access
log_info "Bringing application out of maintenance mode..."
php artisan up

log_success "Rollback successfully completed! System active at commit: $CURRENT_COMMIT"
exit 0
