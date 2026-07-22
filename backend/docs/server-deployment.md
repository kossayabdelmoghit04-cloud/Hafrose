# Guide Complet d'Infrastructure Serveur & Déploiement DevOps — HAFROSE Backend

Ce document constitue le guide de référence DevOps pour l'installation, la sécurisation, l'optimisation et la maintenance du backend Laravel 12 HAFROSE sur un serveur Linux **Ubuntu 24.04 LTS**.

---

## 1. Architecture Serveur Global

L'infrastructure de production HAFROSE repose sur la pile suivante :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Clients & Applications                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS (443) / SSL Let's Encrypt
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Nginx Web Server (1.24+ / HTTP2)                      │
│        - Security Headers (HSTS, CSP, X-Frame) | FastCGI Cache | Gzip       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Unix Socket (/var/run/php/php8.3-fpm.sock)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PHP 8.3-FPM (Process Manager Dynamic)                   │
│        - OPcache (JIT Tracing) | Realpath Cache | Memory Limit 512M          │
└───────────────┬──────────────────────┬──────────────────────┬───────────────┘
                │                      │                      │
                ▼                      ▼                      ▼
┌──────────────────────────────┐┌─────────────┐┌──────────────────────────────┐
│  MariaDB 10.11+ Database     ││ Redis 7+    ││ Supervisor Worker Processes  │
│  (InnoDB / UTF8MB4)          ││ (Cache/Queue││ (php artisan queue:work)     │
└──────────────────────────────┘└─────────────┘└──────────────┬───────────────┘
                                                              │
                                                              ▼
                                               ┌──────────────────────────────┐
                                               │ Crontab / Laravel Scheduler  │
                                               │ (* * * * * schedule:run)     │
                                               └──────────────────────────────┘
```

---

## 2. Arborescence du Dossier `deployment/`

Tous les fichiers et scripts d'infrastructure sont regroupés dans le répertoire `deployment/` à la racine du projet :

```
deployment/
├── cron/
│   └── scheduler.cron            # Crontab Laravel Scheduler & tâches système
├── logrotate/
│   └── hafrose                   # Rotation quotidienne des logs storage/logs/*.log (30 jours)
├── nginx/
│   └── hafrose.conf              # Host Nginx avec HTTP/2, SSL, FastCGI cache, Security Headers
├── permissions/
│   └── permissions.sh            # Script d'application des permissions Linux (www-data, 755/644/775)
├── php/
│   └── php-fpm.conf              # Pool PHP-FPM 8.3 (pm, opcache, realpath, memory_limit)
├── scripts/
│   ├── backup.sh                 # Exécution automatisée des sauvegardes HAFROSE
│   ├── deploy.sh                 # Script de déploiement automatique idempotent avec auto-rollback
│   ├── health-check.sh           # Audit de santé complet des services et endpoints HTTP
│   └── rollback.sh               # Reversion rapide vers le commit Git précédent
├── ssl/
│   └── README.md                 # Guide complet Let's Encrypt & Certbot
└── validation/
    └── server-checklist.md       # Audit de qualification de production (Checklist 20+ points)
```

---

## 3. Installation du Serveur Ubuntu 24.04 LTS

### 3.1 Mises à jour initiales et utilitaires système
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip htop ufw software-properties-common logrotate acl
```

### 3.2 Configuration du pare-feu (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 4. Installation & Configuration de PHP 8.3

### 4.1 Installation de PHP 8.3 et des extensions requises
```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3-fpm php8.3-cli php8.3-common php8.3-mysql \
    php8.3-curl php8.3-mbstring php8.3-xml php8.3-zip php8.3-bcmath \
    php8.3-intl php8.3-opcache php8.3-gd php8.3-redis
```

### 4.2 Application de la configuration Pool PHP-FPM
Copier la configuration optimisée :
```bash
sudo cp deployment/php/php-fpm.conf /etc/php/8.3/fpm/pool.d/hafrose.conf
sudo systemctl restart php8.3-fpm
```

---

## 5. Installation & Configuration de Nginx

### 5.1 Installation
```bash
sudo apt install -y nginx
```

### 5.2 Déploiement de la configuration Nginx
```bash
sudo cp deployment/nginx/hafrose.conf /etc/nginx/sites-available/hafrose.conf
sudo ln -sf /etc/nginx/sites-available/hafrose.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test de la syntaxe Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Base de Données MariaDB & Redis

### 6.1 MariaDB
```bash
sudo apt install -y mariadb-server
sudo mysql_secure_installation
```
Création de la base et de l'utilisateur HAFROSE :
```sql
CREATE DATABASE hafrose CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hafrose_user'@'localhost' IDENTIFIED BY 'PASSWORD_ULTRA_SECURE';
GRANT ALL PRIVILEGES ON hafrose.* TO 'hafrose_user'@'localhost';
FLUSH PRIVILEGES;
```

### 6.2 Redis (Optionnel)
```bash
sudo apt install -y redis-server
sudo systemctl enable --now redis-server
```

---

## 7. Configuration de Supervisor & Queue Workers

```bash
sudo apt install -y supervisor
sudo cp deployment/supervisor/hafrose-worker.conf /etc/supervisor/conf.d/
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start hafrose-worker:*
```

---

## 8. Scheduler Laravel (Cron)

Installer la crontab pour l'utilisateur `www-data` :
```bash
sudo crontab -u www-data deployment/cron/scheduler.cron
```

---

## 9. Configuration SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hafrose.com -d www.hafrose.com -d api.hafrose.com
```

---

## 10. Permissions Linux

Exécuter le script de permissions :
```bash
sudo bash deployment/permissions/permissions.sh /var/www/hafrose/backend
```

---

## 11. Procedures de Déploiement & Rollback

### 11.1 Déploiement automatisé
```bash
cd /var/www/hafrose/backend
sudo bash deployment/scripts/deploy.sh main
```

### 11.2 Rollback d'urgence
```bash
sudo bash deployment/scripts/rollback.sh HEAD@{1}
```

### 11.3 Health Check
```bash
bash deployment/scripts/health-check.sh
```

---

## 12. Surveillance & Maintenance

- **Supervision Supervisor** : `supervisorctl status`
- **Journaux Nginx** : `/var/log/nginx/hafrose_error.log`
- **Journaux PHP-FPM** : `/var/log/php8.3-fpm-hafrose-error.log`
- **Journaux Laravel** : `storage/logs/laravel.log`
- **Commande Health Status** : `php artisan hafrose:deploy:status`
