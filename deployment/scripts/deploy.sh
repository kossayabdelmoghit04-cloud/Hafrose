#!/usr/bin/env bash
# ==============================================================================
# ⚠️  LEGACY SCRIPT — NOT FOR USE WITH DOCKER PRODUCTION STACK ⚠️
# ==============================================================================
# This script was designed for a bare-metal PHP-FPM setup (php8.3-fpm via
# systemd). HAFROSE now runs exclusively via Docker + Docker Compose.
#
# The production deployment is fully managed by:
#   .github/workflows/ci-cd.yml  →  deploy-production job
#   via appleboy/ssh-action + docker compose + docker exec
#
# DO NOT run this script on the production Docker server.
# It is kept for historical reference only.
# ==============================================================================
# HAFROSE Backend — Automated Production Deployment Script (BARE-METAL LEGACY)
# ==============================================================================
# Target OS: Ubuntu 24.04 LTS (bare-metal, no Docker)
# Usage: ./deploy.sh [branch_or_tag]
# Features: Idempotency, Maintenance Mode, Cache Optimization, Service Reloads, Health Checks, Auto-Rollback
# ==============================================================================

set -euo pipefail

# Configuration Parameters
APP_DIR="/var/www/hafrose/backend"
DEPLOY_BRANCH="${1:-main}"
PHP_SERVICE="php8.3-fpm"
NGINX_SERVICE="nginx"
SUPERVISOR_WORKER="hafrose-worker:*"
HEALTH_CHECK_SCRIPT="./deployment/scripts/health-check.sh"
ROLLBACK_SCRIPT="./deployment/scripts/rollback.sh"

# Color Codes for Logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO] ${NC}$1"; }
log_success() { echo -e "${GREEN}[SUCCESS] ${NC}$1"; }
log_warn()    { echo -e "${YELLOW}[WARN] ${NC}$1"; }
log_error()   { echo -e "${RED}[ERROR] ${NC}$1"; }

# ------------------------------------------------------------------------------
# Error Handler & Automatic Rollback Trigger
# ------------------------------------------------------------------------------
on_failure() {
    local exit_code=$?
    log_error "Deployment failed at line $1 with exit code $exit_code."
    log_warn "Initiating automatic rollback to preserve system stability..."
    
    if [ -f "$ROLLBACK_SCRIPT" ]; then
        bash "$ROLLBACK_SCRIPT" || log_error "Automatic rollback encountered secondary errors!"
    else
        log_error "Rollback script not found at $ROLLBACK_SCRIPT. Leaving site in maintenance mode for safety."
    fi
    
    exit "$exit_code"
}

trap 'on_failure $LINENO' ERR

# ------------------------------------------------------------------------------
# Step 1: Pre-flight Verification & Environment Checks
# ------------------------------------------------------------------------------
log_info "Starting HAFROSE automated production deployment (Branch/Tag: $DEPLOY_BRANCH)..."

if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory $APP_DIR does not exist."
    exit 1
fi

cd "$APP_DIR"

# Ensure script is executed with proper write access or root/sudo privileges
if [ "$(id -u)" -ne 0 ] && [ "$(stat -c '%U' .)" != "$(whoami)" ]; then
    log_warn "Script is not running as root or owner. Some service commands may require sudo."
fi

# Save current Git commit hash for rollback reference
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "UNKNOWN")
log_info "Current deployment commit: $PREV_COMMIT"

# ------------------------------------------------------------------------------
# Step 2: Enable Maintenance Mode
# ------------------------------------------------------------------------------
log_info "Enabling application maintenance mode..."
php artisan down --refresh=15 --retry=60 || log_warn "Failed to activate maintenance mode or already down."

# ------------------------------------------------------------------------------
# Step 3: Fetch & Checkout Latest Code (Git Pull)
# ------------------------------------------------------------------------------
log_info "Fetching latest code updates from Git repository..."
git fetch --all --prune
git checkout "$DEPLOY_BRANCH"
git pull origin "$DEPLOY_BRANCH"

NEW_COMMIT=$(git rev-parse HEAD)
log_success "Updated repository to commit: $NEW_COMMIT"

# ------------------------------------------------------------------------------
# Step 4: Install Production PHP Dependencies (Composer)
# ------------------------------------------------------------------------------
log_info "Installing PHP dependencies with Composer..."
composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-ansi

# ------------------------------------------------------------------------------
# Step 5: Execute Database Migrations
# ------------------------------------------------------------------------------
log_info "Running production database migrations..."
php artisan migrate --force --no-interaction

# ------------------------------------------------------------------------------
# Step 6: Application Optimization & Cache Warmup
# ------------------------------------------------------------------------------
log_info "Optimizing Laravel configuration, routes, views, and events cache..."
php artisan hafrose:deploy:optimize --clear --warmup --force

# ------------------------------------------------------------------------------
# Step 7: Linux Permissions Fix
# ------------------------------------------------------------------------------
log_info "Enforcing correct Linux file permissions and ownership..."
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# ------------------------------------------------------------------------------
# Step 8: Restart Queue Workers & Reload Web Server Services
# ------------------------------------------------------------------------------
log_info "Restarting Laravel queue workers..."
php artisan queue:restart

if command -v supervisorctl &>/dev/null; then
    supervisorctl restart "$SUPERVISOR_WORKER" || log_warn "Supervisor worker restart warning."
fi

log_info "Reloading PHP-FPM service..."
if command -v systemctl &>/dev/null; then
    systemctl reload "$PHP_SERVICE" || systemctl restart "$PHP_SERVICE"
fi

log_info "Reloading Nginx service..."
if command -v systemctl &>/dev/null; then
    systemctl reload "$NGINX_SERVICE"
fi

# ------------------------------------------------------------------------------
# Step 9: Disable Maintenance Mode
# ------------------------------------------------------------------------------
log_info "Disabling application maintenance mode..."
php artisan up

# ------------------------------------------------------------------------------
# Step 10: Health Check Verification
# ------------------------------------------------------------------------------
log_info "Executing post-deployment health check..."

if [ -f "$HEALTH_CHECK_SCRIPT" ]; then
    bash "$HEALTH_CHECK_SCRIPT"
else
    log_warn "Health check script $HEALTH_CHECK_SCRIPT not found. Performing fallback status check..."
    php artisan hafrose:deploy:status
fi

log_success "HAFROSE deployment completed successfully! Active Commit: $NEW_COMMIT"
exit 0
