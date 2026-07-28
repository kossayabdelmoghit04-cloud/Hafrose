# HAFROSE — Production Deployment Guide

## 1. Prerequisites
- Linux Server (Ubuntu 22.04 LTS or Debian 12 recommended)
- Docker & Docker Compose v2+ installed
- Domain configured with SSL certificates (Let's Encrypt / Certbot)

---

## 2. Docker Compose Deployment

```bash
# 1. Clone repository
git clone https://github.com/your-org/hafrose.git /var/www/hafrose
cd /var/www/hafrose

# 2. Configure environment variables
cp backend/.env.example backend/.env
# Edit DB credentials, APP_SECRET, and Sanctum domain settings in backend/.env

# 3. Launch Docker infrastructure
docker-compose -f docker-compose.yml up -d --build

# 4. Run database migrations & production optimization commands
docker exec hafrose_backend php artisan migrate --force
docker exec hafrose_backend php artisan config:cache
docker exec hafrose_backend php artisan route:cache
docker exec hafrose_backend php artisan view:cache
```

---

## 3. Rollback Procedure
```bash
# In case of deployment rollback target
git checkout <previous-tag-or-commit>
docker-compose -f docker-compose.yml up -d --build
docker exec hafrose_backend php artisan migrate:rollback
```
