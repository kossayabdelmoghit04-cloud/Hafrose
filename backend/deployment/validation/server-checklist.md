# Checklist de Validation Serveur — HAFROSE Production Infrastructure

Cette checklist constitue l'audit de qualification préalable à chaque mise en production sur un serveur Ubuntu 24.04 LTS hébergeant le backend Laravel 12 HAFROSE.

**Légende :** `[ ]` = À vérifier | `[x]` = Validé | `[N/A]` = Non applicable

---

## 1. Environnement PHP

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 1.1 | PHP >= 8.3 installé | `php -v` | [ ] |
| 1.2 | Extension `pdo_mysql` | `php -m \| grep pdo_mysql` | [ ] |
| 1.3 | Extension `opcache` | `php -m \| grep opcache` | [ ] |
| 1.4 | Extension `mbstring` | `php -m \| grep mbstring` | [ ] |
| 1.5 | Extension `zip` | `php -m \| grep zip` | [ ] |
| 1.6 | Extension `gd` | `php -m \| grep gd` | [ ] |
| 1.7 | Extension `curl` | `php -m \| grep curl` | [ ] |
| 1.8 | Extension `bcmath` | `php -m \| grep bcmath` | [ ] |
| 1.9 | Extension `redis` (optionnel) | `php -m \| grep redis` | [ ] |
| 1.10 | PHP-FPM service actif | `systemctl is-active php8.3-fpm` | [ ] |
| 1.11 | OPcache activé et fonctionnel | `php -r "var_dump(opcache_get_status());"` | [ ] |
| 1.12 | `memory_limit` >= 256M | `php -i \| grep memory_limit` | [ ] |
| 1.13 | `upload_max_filesize` >= 20M | `php -i \| grep upload_max_filesize` | [ ] |
| 1.14 | `expose_php` = Off | `php -i \| grep expose_php` | [ ] |

---

## 2. Permissions & Propriétaires Linux

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 2.1 | Propriétaire `storage/` = `www-data:www-data` | `stat -c '%U:%G' storage` | [ ] |
| 2.2 | Permissions `storage/` = 775 | `stat -c '%a' storage` | [ ] |
| 2.3 | Propriétaire `bootstrap/cache/` = `www-data:www-data` | `stat -c '%U:%G' bootstrap/cache` | [ ] |
| 2.4 | Permissions `bootstrap/cache/` = 775 | `stat -c '%a' bootstrap/cache` | [ ] |
| 2.5 | Scripts deploy.sh exécutables | `ls -la deployment/scripts/` | [ ] |
| 2.6 | `.env` accessible seulement par `www-data` | `stat -c '%a %U' .env` | [ ] |

---

## 3. SSL / HTTPS

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 3.1 | Certificat Let's Encrypt valide et non expiré | `certbot certificates` | [ ] |
| 3.2 | Renouvellement auto certbot timer actif | `systemctl is-active certbot.timer` | [ ] |
| 3.3 | HTTP redirige vers HTTPS (301) | `curl -I http://hafrose.com` | [ ] |
| 3.4 | HTTPS répond avec code 200 | `curl -I https://hafrose.com/api/products` | [ ] |
| 3.5 | En-tête HSTS présent dans réponse | `curl -I https://hafrose.com \| grep Strict-Transport` | [ ] |
| 3.6 | Protocols TLS 1.2 et 1.3 uniquement | `openssl s_client -connect hafrose.com:443` | [ ] |

---

## 4. Configuration Nginx

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 4.1 | Syntaxe Nginx valide | `nginx -t` | [ ] |
| 4.2 | Nginx service actif | `systemctl is-active nginx` | [ ] |
| 4.3 | HTTP/2 activé | `curl -I --http2 https://hafrose.com` | [ ] |
| 4.4 | En-tête `X-Frame-Options: SAMEORIGIN` | `curl -I https://hafrose.com` | [ ] |
| 4.5 | En-tête `X-Content-Type-Options: nosniff` | `curl -I https://hafrose.com` | [ ] |
| 4.6 | `server_tokens off` (version non exposée) | `curl -I https://hafrose.com \| grep Server` | [ ] |
| 4.7 | Accès `.env` bloqué (HTTP 403/404) | `curl -I https://hafrose.com/.env` | [ ] |
| 4.8 | Accès `composer.json` bloqué | `curl -I https://hafrose.com/composer.json` | [ ] |
| 4.9 | Gzip activé pour les réponses JSON | `curl -I -H "Accept-Encoding: gzip" https://hafrose.com/api/products` | [ ] |
| 4.10 | Logs access et error correctement créés | `ls /var/log/nginx/hafrose_*.log` | [ ] |

---

## 5. Cron & Scheduler Laravel

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 5.1 | Crontab `www-data` actif | `crontab -u www-data -l` | [ ] |
| 5.2 | Entrée `schedule:run` toutes les minutes | `crontab -u www-data -l \| grep schedule` | [ ] |
| 5.3 | Exécution manuelle du scheduler | `php artisan schedule:run` | [ ] |
| 5.4 | Log du scheduler écrit | `cat storage/logs/cron-scheduler.log` | [ ] |

---

## 6. Supervisor & Queue Workers

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 6.1 | Supervisor service actif | `systemctl is-active supervisor` | [ ] |
| 6.2 | Programme `hafrose-worker` chargé | `supervisorctl status` | [ ] |
| 6.3 | 4 processus workers en état RUNNING | `supervisorctl status hafrose-worker:*` | [ ] |
| 6.4 | Logs worker créés | `ls storage/logs/supervisor-worker*.log` | [ ] |
| 6.5 | `stopwaitsecs` = 3600 (jobs longs protégés) | `grep stopwaitsecs deployment/supervisor/hafrose-worker.conf` | [ ] |

---

## 7. Stockage & Cache Laravel

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 7.1 | Lien symbolique `storage/app/public` | `php artisan storage:link` | [ ] |
| 7.2 | Cache config compilé | `ls bootstrap/cache/config.php` | [ ] |
| 7.3 | Cache routes compilé | `ls bootstrap/cache/routes-v7.php` | [ ] |
| 7.4 | Cache vues compilées (Blade) | `ls storage/framework/views/` | [ ] |
| 7.5 | `php artisan optimize` succès | `php artisan optimize` | [ ] |
| 7.6 | Commande health check artisan | `php artisan hafrose:deploy:status` | [ ] |

---

## 8. Logs & Rotation

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 8.1 | Fichier logrotate installé | `ls /etc/logrotate.d/hafrose` | [ ] |
| 8.2 | Syntaxe logrotate valide | `logrotate -d /etc/logrotate.d/hafrose` | [ ] |
| 8.3 | Log rotation en mode `daily` | `grep daily /etc/logrotate.d/hafrose` | [ ] |
| 8.4 | Rotation conserve 30 jours | `grep rotate /etc/logrotate.d/hafrose` | [ ] |
| 8.5 | Compression gzip active | `grep compress /etc/logrotate.d/hafrose` | [ ] |

---

## 9. Sauvegardes

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 9.1 | Crontab backup quotidien à 02:00 | `crontab -u www-data -l \| grep backup` | [ ] |
| 9.2 | Exécution manuelle backup dry-run | `php artisan hafrose:backup:run --dry-run` | [ ] |
| 9.3 | Répertoire de backup accessible | `ls storage/app/backups/` | [ ] |

---

## 10. Monitoring & Health Endpoint

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 10.1 | Endpoint deployment/status répond 401 sans auth | `curl -s -o /dev/null -w "%{http_code}" https://hafrose.com/api/admin/system/deployment/status` | [ ] |
| 10.2 | Endpoint metrics répond 401 sans auth | `curl -s -o /dev/null -w "%{http_code}" https://hafrose.com/api/admin/system/metrics` | [ ] |
| 10.3 | Health check script sans erreur | `bash deployment/scripts/health-check.sh` | [ ] |

---

## 11. Firewall & Ports

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 11.1 | UFW actif | `ufw status` | [ ] |
| 11.2 | Port 22 (SSH) autorisé | `ufw status \| grep 22` | [ ] |
| 11.3 | Port 80 (HTTP) autorisé | `ufw status \| grep 80` | [ ] |
| 11.4 | Port 443 (HTTPS) autorisé | `ufw status \| grep 443` | [ ] |
| 11.5 | Port 3306 (MariaDB) fermé aux connexions externes | `ufw status \| grep 3306` | [ ] |
| 11.6 | Port 6379 (Redis) fermé aux connexions externes | `ufw status \| grep 6379` | [ ] |

---

## 12. DNS & Résolution de Noms

| # | Vérification | Commande de contrôle | Statut |
|---|---|---|---|
| 12.1 | A Record `hafrose.com` résolu | `dig hafrose.com A` | [ ] |
| 12.2 | A Record `www.hafrose.com` résolu | `dig www.hafrose.com A` | [ ] |
| 12.3 | A Record `api.hafrose.com` résolu | `dig api.hafrose.com A` | [ ] |
| 12.4 | Propagation DNS confirmée | `nslookup hafrose.com 8.8.8.8` | [ ] |

---

## Résultat Global de Qualification

```
Date d'audit      : ______________________
Auditeur          : ______________________
Version déployée  : ______________________
Commit Git        : ______________________
Total vérifications : ___/45
Résultat          : [ ] APPROUVÉ  [ ] REFUSÉ
Commentaires      :
```
