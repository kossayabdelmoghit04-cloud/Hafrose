# HAFROSE — Guide de Déploiement & Exploitation en Production

Ce document décrit l'architecture, les prérequis, les procédures de mise en production, la surveillance et la gestion des incidents pour la plateforme e-commerce HAFROSE.

---

## 1. Architecture Cible

```text
                                  INTERNET
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   DNS Records   │
                            │ hafrose.com (A) │
                            └────────┬────────┘
                                     │
                        Ports 80/443 │ HTTPS/SSL
                                     ▼
                      ┌─────────────────────────────┐
                      │    Nginx Reverse Proxy      │
                      │  (hafrose_nginx container)  │
                      └──────┬───────────────┬──────┘
                             │               │
            Static SPA (/)   │               │ FastCGI (/api/, /sanctum/, /health)
                             ▼               ▼
                    ┌────────────────┐ ┌────────────────┐
                    │  Frontend SPA  │ │  Backend API   │
                    │   React/Vite   │ │  Laravel 12    │
                    │   (Port 80)    │ │ (PHP-FPM 9000) │
                    └────────────────┘ └───────┬────────┘
                                               │
                                 ┌─────────────┴─────────────┐
                                 │                           │
                                 ▼                           ▼
                        ┌────────────────┐          ┌────────────────┐
                        │    Database    │          │ Persistent Vol │
                        │   MySQL 8.0    │          │    Storage     │
                        │  (Interne DB)  │          │ (/storage/app) │
                        └────────────────┘          └────────────────┘
```

### Principes Fondamentaux de Sécurité Réseau
1. **Ports exposés publiquement :** `80` (HTTP avec redirection 301 immédiate vers HTTPS) et `443` (HTTPS TLS 1.2 / 1.3 avec HSTS).
2. **Isolation interne :** Tous les conteneurs applicatifs (`hafrose_backend`, `hafrose_frontend`, `hafrose_db`) communiquent exclusivement sur le réseau Docker interne isolé `hafrose_network` (bridge).
3. **Aucune exposition de base de données :** Le port `3306` (MySQL) n'est **jamais** publié sur l'interface publique de la machine.

---

## 2. Prérequis Serveur

| Composant | Spécification Minimale | Spécification Recommandée |
| :--- | :--- | :--- |
| **Système d'exploitation** | Ubuntu 24.04 LTS x86_64 | Ubuntu 24.04 LTS x86_64 |
| **CPU** | 2 vCPU | 4 vCPU |
| **Mémoire RAM** | 4 Go | 8 Go |
| **Disque** | 40 Go SSD NVMe | 80 Go SSD NVMe |
| **Docker Engine** | >= 24.0 | >= 26.0 |
| **Docker Compose** | >= 2.20 | >= 2.27 |
| **Git** | >= 2.34 | >= 2.43 |
| **UFW (Firewall)** | Activé | Activé |

---

## 3. Configuration Réseau & Pare-feu (Firewall)

Sur le serveur de production, n'ouvrir que les ports strictement nécessaires :

```bash
# Activation et règles UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Administration'
sudo ufw allow 80/tcp comment 'HTTP ACME & Redirection'
sudo ufw allow 443/tcp comment 'HTTPS Chiffré'
sudo ufw enable
```

Vérification :
```bash
sudo ufw status verbose
```

---

## 4. Matrice des Variables d'Environnement

### Variables Applicatives

| Variable | Obligatoire | Secret | Source | Exemple / Usage |
| :--- | :---: | :---: | :---: | :--- |
| `APP_NAME` | Oui | Non | `.env` | `Hafrose` |
| `APP_ENV` | Oui | Non | `.env` | `production` (Obligatoire) |
| `APP_DEBUG` | Oui | Non | `.env` | `false` (Strictement obligatoire) |
| `APP_URL` | Oui | Non | `.env` | `https://hafrose.com` |
| `APP_KEY` | Oui | **Oui** | Secret `.env` | Clé générée par `artisan key:generate` |
| `DB_CONNECTION` | Oui | Non | `.env` | `mysql` |
| `DB_HOST` | Oui | Non | `.env` | `db` (nom du service Docker interne) |
| `DB_PORT` | Oui | Non | `.env` | `3306` |
| `DB_DATABASE` | Oui | Non | `.env` | `hafrose` |
| `DB_USERNAME` | Oui | **Oui** | Secret `.env` | Compte de service dédié |
| `DB_PASSWORD` | Oui | **Oui** | Secret `.env` | Mot de passe robuste |
| `DB_ROOT_PASSWORD` | Oui | **Oui** | Secret `.env` | Mot de passe root MySQL |
| `SESSION_DRIVER` | Oui | Non | `.env` | `database` ou `redis` |
| `QUEUE_CONNECTION` | Oui | Non | `.env` | `database` ou `redis` |
| `CACHE_STORE` | Oui | Non | `.env` | `database` ou `redis` |
| `FILESYSTEM_DISK` | Oui | Non | `.env` | `local` (ou `s3`) |
| `FRONTEND_URL` | Oui | Non | `.env` | `https://hafrose.com` |
| `CORS_ALLOWED_ORIGINS`| Oui | Non | `.env` | `https://hafrose.com,https://www.hafrose.com` |
| `TURNSTILE_ENABLED` | Oui | Non | `.env` | `true` |
| `TURNSTILE_SITE_KEY` | Oui | Non | `.env` | Clé de site Cloudflare |
| `TURNSTILE_SECRET_KEY`| Oui | **Oui** | Secret `.env` | Clé secrète Cloudflare |
| `VITE_API_BASE_URL` | Oui | Non | Build arg | `/api` |
| `VITE_STORAGE_URL` | Oui | Non | Build arg | `/storage` |

### Secrets GitHub Actions (CI/CD)

| Nom du Secret | Description |
| :--- | :--- |
| `PROD_SERVER_IP` | Adresse IPv4 publique du serveur de production |
| `PROD_SERVER_USER` | Utilisateur Linux dédié au déploiement (ex. `deploy`) |
| `PROD_SSH_PRIVATE_KEY` | Clé privée SSH (OpenSSH Ed25519 ou RSA 4096) autorisée sur le serveur |

> [!IMPORTANT]
> Les secrets ne doivent **jamais** être commités dans le dépôt Git. Le fichier `.env` de production réside exclusivement sur le serveur hôte dans `/var/www/hafrose/.env`.

---

## 5. Procédure de Déploiement

### Option A — Déploiement Automatique via GitHub Actions (Recommandé)

Lors d'un push ou merge sur la branche `main` :
1. Les jobs `frontend-ci`, `backend-ci`, et `security-checks` s'exécutent.
2. Le job `deploy-production` vérifie la présence des secrets SSH (`deploy-guard`).
3. Si les secrets sont présents, la connexion SSH déclenche la mise à jour déterministe (`${{ github.sha }}`).
4. En cas d'anomalie ou d'échec du health check, le rollback automatique est déclenché immédiatement.

### Option B — Déploiement Manuel Initial (Provisioning)

```bash
# 1. Cloner le repository sur le serveur
git clone https://github.com/kossayabdelmoghit04-cloud/Hafrose.git /var/www/hafrose
cd /var/www/hafrose

# 2. Configurer le fichier d'environnement
cp backend/.env.example .env
# Renseigner les secrets de production (APP_KEY, DB_PASSWORD, etc.)
nano .env

# 3. Lancer la compilation et les conteneurs
docker compose up -d --build

# 4. Exécuter les migrations et caches de production
docker exec hafrose_backend php artisan migrate --force
docker exec hafrose_backend php artisan hafrose:deploy:optimize --warmup --force

# 5. Valider l'état du système
docker exec hafrose_backend php artisan hafrose:deploy:status
curl -f http://127.0.0.1/health
```

---

## 6. Stratégie de Rollback

En cas d'incident post-déploiement :

### 1. Rollback Applicatif Rapide
```bash
cd /var/www/hafrose

# Activer le mode maintenance immédiat
docker exec hafrose_backend php artisan down --refresh=15 --retry=60

# Revenir au commit stable précédent
git checkout <COMMIT_SHA_PRECEDENT>

# Reconstruire et relancer les conteneurs
docker compose up -d --build

# Réinitialiser les caches applicatifs
docker exec hafrose_backend php artisan hafrose:deploy:optimize --clear --warmup --force

# Désactiver la maintenance
docker exec hafrose_backend php artisan up

# Vérifier le statut
docker exec hafrose_backend php artisan hafrose:deploy:status
```

> [!CAUTION]
> **Rollback de Base de Données :**
> Les migrations applicatives qui suppriment ou modifient des colonnes peuvent entraîner des pertes de données irréversibles si un rollback automatique est exécuté sans discernement. Ne jamais exécuter `migrate:rollback` sans analyse préalable et sauvegarde validée.

---

## 7. Vérifications de Santé (Health Checks)

### Points de Terminaison
* **HTTP Public Health Check :** `GET /health` ou `GET /api/health`
  * Réponse 200 : `{"status": "healthy", "services": {"application": "ok", "database": "ok", "storage": "ok"}}`
  * Réponse 503 : `{"status": "unhealthy", ...}`
  * Aucune fuite d'informations internes ou d'identifiants.
* **CLI Artisan :**
  ```bash
  docker exec hafrose_backend php artisan hafrose:deploy:status
  docker exec hafrose_backend php artisan hafrose:deploy:status --json
  ```
* **Script d'audit complet :**
  ```bash
  bash deployment/scripts/health-check.sh https://hafrose.com/health
  ```

---

## 8. Gestion des Logs & Dépannage

### Emplacements des Logs
* **Logs applicatifs Laravel :** `storage/logs/laravel.log` (accessible dans le volume `backend_storage`)
* **Logs conteneurs :** `docker logs hafrose_backend`, `docker logs hafrose_nginx`
* **Logs d'accès et erreurs Nginx :** `/var/log/nginx/hafrose_access.log`, `/var/log/nginx/hafrose_error.log`

### Diagnostics Rapides

| Symptôme | Cause Probable | Action Corrective |
| :--- | :--- | :--- |
| **502 Bad Gateway** | Backend PHP-FPM arrêté ou crashé | `docker logs hafrose_backend` ; redémarrer `docker compose restart backend` |
| **SQLSTATE Connection Refused** | Conteneur MySQL non démarré ou mot de passe incorrect | `docker logs hafrose_db` ; vérifier `DB_PASSWORD` dans `.env` |
| **Permission Denied (storage)** | Propriétaire incorrect sur `storage/` | `docker exec hafrose_backend chown -R www-data:www-data /var/www/html/storage` |
| **CORS Error sur API** | Domaine d'origine non listé dans `CORS_ALLOWED_ORIGINS` | Ajouter l'origine exacte dans `.env` puis `php artisan config:cache` |
| **Images 404 sur `/storage/`** | Volume `backend_storage` non monté sur Nginx ou lien manquant | Vérifier le volume dans `docker-compose.yml` et `php artisan storage:link` |

---

## 9. Procédure d'Urgence (Incident Majeur)

En cas de compromission, défaillance matérielle ou corruption de données :

```bash
# 1. Isoler immédiatement la plateforme
docker exec hafrose_backend php artisan down --message="Maintenance urgente en cours"

# 2. Restaurer la dernière sauvegarde validée
# Les sauvegardes sont stockées dans storage/app/backups/
docker exec hafrose_backend php artisan hafrose:backup:run --dry-run

# 3. Arrêter les services si nécessaire
docker compose down

# 4. Redémarrage contrôlé post-investigation
docker compose up -d
docker exec hafrose_backend php artisan up
```
