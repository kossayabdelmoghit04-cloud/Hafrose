#!/usr/bin/env bash
# ==============================================================================
# HAFROSE Backend — System Health Check Script
# ==============================================================================
# Target OS: Ubuntu 24.04 LTS
# Usage: ./health-check.sh [endpoint_url]
# Features: HTTP Endpoint Check, Systemd Services Check, Supervisor Workers Check, Storage Writeability
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/hafrose/backend"
HEALTH_URL="${1:-http://127.0.0.1/api/admin/system/deployment/status}"
FALLBACK_URL="http://127.0.0.1/api/products"

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

ERRORS=0

log_info "Executing HAFROSE infrastructure health check..."

# ------------------------------------------------------------------------------
# Check 1: Systemd Web Server Services (Nginx & PHP-FPM)
# ------------------------------------------------------------------------------
log_info "1/5 Checking Systemd services..."

if command -v systemctl &>/dev/null; then
    if systemctl is-active --quiet nginx; then
        log_success "  ✓ Nginx service is active and running."
    else
        log_error "  ✗ Nginx service is inactive or failing!"
        ERRORS=$((ERRORS + 1))
    fi

    if systemctl is-active --quiet php8.3-fpm; then
        log_success "  ✓ PHP 8.3-FPM service is active and running."
    else
        log_error "  ✗ PHP 8.3-FPM service is inactive or failing!"
        ERRORS=$((ERRORS + 1))
    fi
else
    log_warn "  ! systemctl unavailable (environment non-systemd). Skipping service unit checks."
fi

# ------------------------------------------------------------------------------
# Check 2: Supervisor Queue Workers
# ------------------------------------------------------------------------------
log_info "2/5 Checking Supervisor queue workers..."

if command -v supervisorctl &>/dev/null; then
    if supervisorctl status hafrose-worker:* 2>&1 | grep -q "RUNNING"; then
        log_success "  ✓ Supervisor hafrose-worker processes are RUNNING."
    else
        log_error "  ✗ Supervisor workers are not running!"
        ERRORS=$((ERRORS + 1))
    fi
else
    log_warn "  ! supervisorctl unavailable. Skipping Supervisor process check."
fi

# ------------------------------------------------------------------------------
# Check 3: Directory Writeability & Disk Permissions
# ------------------------------------------------------------------------------
log_info "3/5 Checking directory write permissions..."

if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    
    TEST_FILE="storage/framework/cache/health_test_$(date +%s).tmp"
    if touch "$TEST_FILE" 2>/dev/null; then
        rm -f "$TEST_FILE"
        log_success "  ✓ storage/ directory is writeable."
    else
        log_error "  ✗ storage/ directory is NOT writeable!"
        ERRORS=$((ERRORS + 1))
    fi

    TEST_BOOTSTRAP="bootstrap/cache/health_test_$(date +%s).tmp"
    if touch "$TEST_BOOTSTRAP" 2>/dev/null; then
        rm -f "$TEST_BOOTSTRAP"
        log_success "  ✓ bootstrap/cache/ directory is writeable."
    else
        log_error "  ✗ bootstrap/cache/ directory is NOT writeable!"
        ERRORS=$((ERRORS + 1))
    fi
else
    log_warn "  ! Directory $APP_DIR does not exist. Skipping file permissions test."
fi

# ------------------------------------------------------------------------------
# Check 4: Laravel CLI Artisan Deployment Status
# ------------------------------------------------------------------------------
log_info "4/5 Executing Laravel Artisan internal status check..."

if [ -d "$APP_DIR" ] && command -v php &>/dev/null; then
    if php artisan hafrose:deploy:status &>/dev/null; then
        log_success "  ✓ Artisan hafrose:deploy:status reported healthy status."
    else
        log_error "  ✗ Artisan deployment status check returned error!"
        ERRORS=$((ERRORS + 1))
    fi
fi

# ------------------------------------------------------------------------------
# Check 5: HTTP Endpoint Availability via cURL
# ------------------------------------------------------------------------------
log_info "5/5 Querying HTTP application endpoint..."

if command -v curl &>/dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

    if [[ "$HTTP_CODE" =~ ^(200|401|403)$ ]]; then
        log_success "  ✓ Target HTTP endpoint ($HEALTH_URL) responded with HTTP $HTTP_CODE."
    else
        log_warn "  ! Target endpoint responded with HTTP $HTTP_CODE. Testing public fallback route..."
        FALLBACK_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FALLBACK_URL" || echo "000")
        if [[ "$FALLBACK_CODE" == "200" ]]; then
            log_success "  ✓ Public API route ($FALLBACK_URL) responded with HTTP 200 OK."
        else
            log_error "  ✗ HTTP health check failed! Response code: $FALLBACK_CODE"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    log_warn "  ! curl not installed. Skipping HTTP endpoint check."
fi

# ------------------------------------------------------------------------------
# Summary & Exit Code
# ------------------------------------------------------------------------------
if [ "$ERRORS" -eq 0 ]; then
    log_success "ALL HEALTH CHECKS PASSED SUCCESSFULLY (0 Errors)."
    exit 0
else
    log_error "HEALTH CHECK FAILED WITH $ERRORS ERROR(S)."
    exit 1
fi
