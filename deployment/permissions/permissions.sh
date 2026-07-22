#!/usr/bin/env bash
# ==============================================================================
# HAFROSE Backend — Linux Security Permissions & Ownership Script
# ==============================================================================
# Target OS: Ubuntu 24.04 LTS
# Web User/Group: www-data:www-data
# Usage: ./permissions.sh [app_directory]
# ==============================================================================

set -euo pipefail

APP_DIR="${1:-/var/www/hafrose/backend}"
WEB_USER="www-data"
WEB_GROUP="www-data"

# Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[INFO] Configuring HAFROSE Linux directory permissions and ownership...${NC}"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}[ERROR] Target directory $APP_DIR does not exist.${NC}"
    exit 1
fi

cd "$APP_DIR"

# ------------------------------------------------------------------------------
# 1. Base User and Group Ownership Setup
# ------------------------------------------------------------------------------
echo -e "${BLUE}1/4 Setting base user/group ownership to $WEB_USER:$WEB_GROUP...${NC}"
chown -R "$WEB_USER:$WEB_GROUP" . 2>/dev/null || echo -e "${YELLOW}[WARN] Must run with sudo to modify user ownership.${NC}"

# ------------------------------------------------------------------------------
# 2. Standard Directory & File Permissions Mode
# ------------------------------------------------------------------------------
echo -e "${BLUE}2/4 Setting standard directory (755) and file (644) permissions...${NC}"
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Make shell scripts explicitly executable
if [ -d "deployment/scripts" ]; then
    chmod +x deployment/scripts/*.sh 2>/dev/null || true
fi
if [ -d "deployment/permissions" ]; then
    chmod +x deployment/permissions/*.sh 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# 3. Writable Directories Setup (Storage & Bootstrap Cache)
# ------------------------------------------------------------------------------
echo -e "${BLUE}3/4 Setting 775 permissions for Laravel writable directories...${NC}"

# Storage directory subfolders setup
mkdir -p storage/app/public \
         storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/testing \
         storage/framework/views \
         storage/logs \
         bootstrap/cache

chmod -R 775 storage bootstrap/cache

# ------------------------------------------------------------------------------
# 4. Default Umask & Access Control Lists (ACLs) Configuration
# ------------------------------------------------------------------------------
echo -e "${BLUE}4/4 Applying POSIX Access Control Lists (ACLs) for persistent permissions...${NC}"

if command -v setfacl &>/dev/null; then
    # Ensure new files created by PHP-FPM or CLI retain www-data group writeability
    setfacl -R -m u::rwx,g::rwx,o::r-x storage bootstrap/cache
    setfacl -dR -m u::rwx,g::rwx,o::r-x storage bootstrap/cache
    echo -e "${GREEN}  ✓ POSIX ACLs configured for storage and bootstrap/cache.${NC}"
else
    echo -e "${YELLOW}  ! setfacl command unavailable. Falling back to standard chmod.${NC}"
fi

echo -e "${GREEN}[SUCCESS] Permissions successfully updated for $APP_DIR.${NC}"
exit 0
