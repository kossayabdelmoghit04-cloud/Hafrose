# HAFROSE — Phase 5.1 Production Infrastructure & Go-Live Report

> **Date :** 2026-09-02  
> **Branche :** `main`  
> **Commit de référence audité :** `1f0b34f` (`origin/main`)  
> **Inspecteur :** Antigravity (Google DeepMind)

---

## 1. Infrastructure

### État Actuel
* **Dépôt local & distant :** Code complet, architecture Docker multi-conteneurs prête, 413 tests PHPUnit validés (1656 assertions), frontend React 19 / Vite optimisé sans régression.
* **Environnement cible :** Serveur physique ou VPS sous **Ubuntu 24.04 LTS (x86_64)** avec Docker Engine et Docker Compose v2.
* **Statut du serveur de production :** 🔴 **NON PROVISIONNÉ** (Aucune instance Ubuntu 24.04 LTS active identifiée sur le réseau externe).

### Procédure de Provisioning Reproductible (Serveur Nu)
```bash
# 1. Mise à niveau du système
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw ca-certificates gnupg lsb-release unzip

# 2. Installation officielle de Docker Engine & Compose v2
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Création de l'utilisateur de déploiement dédié
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy

# 4. Préparation du répertoire de production
sudo mkdir -p /var/www/hafrose
sudo chown -R deploy:deploy /var/www/hafrose
```

---

## 2. SSH & Hardening

* **Statut :** 🔴 **CLÉ SSH CI/CD NON CONFIGURÉE**
* **Principe :** Authentification exclusivement par clé publique/privée Ed25519. Aucun mot de passe dans le code ou le chat.
* **Utilisateur :** `deploy` (non root).

### Procédure de Génération & Déploiement de Clé
```bash
# Sur la machine sécurisée de l'opérateur (PAS sur un serveur partagé) :
ssh-keygen -t ed25519 -C "hafrose-ci-cd-deploy" -f ~/.ssh/hafrose_deploy_key -N ""

# Copie de la clé publique sur le serveur :
ssh-copy-id -i ~/.ssh/hafrose_deploy_key.pub deploy@<PROD_SERVER_IP>

# Test de connexion :
ssh -i ~/.ssh/hafrose_deploy_key deploy@<PROD_SERVER_IP> "docker --version && echo 'SSH_SUCCESS'"
```

---

## 3. GitHub Secrets

* **Statut :** 🔴 **3 SECRETS MANQUANTS**
* **Emplacement :** `GitHub Repository` > `Settings` > `Secrets and variables` > `Actions` > `New repository secret`

| Secret | Statut Actuel | Rôle / Valeur Attendue |
| :--- | :---: | :--- |
| `PROD_SERVER_IP` | ❌ Absent | Adresse IP publique (ou nom d'hôte SSH) du serveur Ubuntu de production |
| `PROD_SERVER_USER` | ❌ Absent | Nom d'utilisateur SSH configuré (ex. `deploy`) |
| `PROD_SSH_PRIVATE_KEY` | ❌ Absent | Contenu textuel complet de la clé privée Ed25519 (ex. `~/.ssh/hafrose_deploy_key`) |

> [!IMPORTANT]
> Le `deploy-guard` du workflow `.github/workflows/ci-cd.yml` (lignes 210-222) protège activement le pipeline. En l'absence de ces 3 variables, le job de déploiement SSH s'arrête avec le diagnostic :  
> `::warning title=Deployment Guard::DEPLOYMENT BLOCKED — PRODUCTION SECRETS NOT CONFIGURED`

---

## 4. DNS

* **Domaines cibles :** `hafrose.com`, `www.hafrose.com`, `api.hafrose.com`
* **Statut Actuel :** 🔴 **NON POINTÉS VERS LE SERVEUR PROD**

### Matrice DNS à Configurer chez le Registrar
| Hôte / Enregistrement | Type | Valeur Cible |
| :--- | :---: | :--- |
| `@` (`hafrose.com`) | `A` | `<PROD_SERVER_IP>` |
| `www` (`www.hafrose.com`) | `CNAME` ou `A` | `hafrose.com` (ou `<PROD_SERVER_IP>`) |
| `api` (`api.hafrose.com`) | `A` | `<PROD_SERVER_IP>` |

**Validation de la propagation publique :**
```bash
nslookup hafrose.com 8.8.8.8
nslookup www.hafrose.com 1.1.1.1
nslookup api.hafrose.com 8.8.8.8
```

---

## 5. SSL / HTTPS

* **Statut :** 🔴 **CERTIFICATS ABSENTS** (`deployment/ssl/` ne contient aucun fichier de clé/certificat pour des raisons de sécurité).
* **Configuration Nginx :** Nginx est configuré pour lire `/etc/nginx/ssl/fullchain.pem` et `/etc/nginx/ssl/privkey.pem`.
* **Couverture :** `hafrose.com`, `www.hafrose.com`, `api.hafrose.com` inclus dans `production.conf`.
* **Sécurité :** TLS 1.2 / TLS 1.3 activés, HTTP redirigé en 301 vers HTTPS, HSTS actif (`includeSubDomains`), `server_tokens off;` appliqué.

### Procédure d'Obtention Let's Encrypt (sur le serveur de production)
```bash
# Une fois les DNS propagés et les ports 80/443 ouverts dans UFW :
sudo apt-get install -y certbot

# Génération en mode autonome (port 80 libre avant le premier up docker)
sudo certbot certonly --standalone \
  -d hafrose.com -d www.hafrose.com -d api.hafrose.com \
  --agree-tos --email admin@hafrose.com --non-interactive

# Copie dans le montage local Docker
sudo cp /etc/letsencrypt/live/hafrose.com/fullchain.pem /var/www/hafrose/deployment/ssl/
sudo cp /etc/letsencrypt/live/hafrose.com/privkey.pem /var/www/hafrose/deployment/ssl/
sudo chmod 644 /var/www/hafrose/deployment/ssl/fullchain.pem
sudo chmod 600 /var/www/hafrose/deployment/ssl/privkey.pem
sudo chown deploy:deploy /var/www/hafrose/deployment/ssl/*.pem

# Timer de renouvellement automatique
echo "0 3 * * * root certbot renew --quiet --post-hook 'docker exec hafrose_nginx nginx -s reload'" | sudo tee /etc/cron.d/certbot-renew
```

---

## 6. Docker & Architecture Réseau

* **Architecture interne :**
  ```text
  Internet ──► Port 80/443 (Nginx Reverse Proxy)
                     │
         hafrose_network (Réseau bridge interne isolé)
         ├── frontend:80 (Nginx SPA, try_files SPA fallback)
         ├── backend:9000 (PHP 8.4-FPM Alpine)
         └── db:3306 (MySQL 8.0, AUCUN PORT EXTERNE)
  ```
* **Ports Publiquement Exposés :** `80`, `443` uniquement.
* **Ports Internes Protégés :** `3306` (MySQL) et `9000` (PHP-FPM) non publiés sur l'hôte.
* **Volumes Persistants :** `db_data` (MySQL), `backend_storage` (Laravel storage), `nginx_logs`.

---

## 7. Database (MySQL 8.0)

* **Statut :** 🟡 **PRÊT POUR INITIALISATION**
* **Conteneur :** `mysql:8.0` avec `healthcheck: ["CMD", "mysqladmin", "ping", "-h", "localhost"]`.
* **Utilisateur applicatif dédié :** L'application utilise `DB_USERNAME=hafrose_app` (jamais `root`).
* **Protection contre les seeders de test :** `TestCustomerSeeder` et `UserSeeder` intègrent des gardes stricts empêchant toute exécution en environnement `production` ou `local` (validé par tests unitaires dédiés).

---

## 8. Sécurité (Firewall, Headers, .env)

### Matrice du Pare-feu (UFW)
| Port | Protocole | Service | Accessible Internet | Justification |
| :---: | :---: | :--- | :---: | :--- |
| **22** | TCP | OpenSSH | **OUI** | Administration et déploiement CI/CD par clé |
| **80** | TCP | Nginx HTTP | **OUI** | Challenge ACME Let's Encrypt + Redirection 301 HTTPS |
| **443** | TCP | Nginx HTTPS | **OUI** | Trafic applicatif web et API sécurisé |
| **3306** | TCP | MySQL 8.0 | **NON** | Réseau interne Docker uniquement |
| **9000** | TCP | PHP-FPM | **NON** | Réseau interne Docker uniquement |

### En-têtes de Sécurité HTTP (Nginx)
* `Strict-Transport-Security: max-age=31536000; includeSubDomains`
* `X-Frame-Options: SAMEORIGIN`
* `X-Content-Type-Options: nosniff`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: camera=(), microphone=(), geolocation=()`
* `server_tokens off;`

### Fichiers Protégés
* `.env`, `.env.*` (hors `.env.example`) sont strictement ignorés dans `.gitignore` racine et `backend/.gitignore`.
* `deployment/ssl/*.pem`, `*.key` protégés dans `deployment/ssl/.gitignore`.
* Aucune clé secrète, mot de passe ou certificat présent dans le dépôt Git.

---

## 9. Déploiement Automatique & Pipeline CI/CD

Le workflow `.github/workflows/ci-cd.yml` est complètement structuré :
1. **`frontend-ci` :** Typecheck TypeScript (`tsc --noEmit`), ESLint (`npm run lint`), Build de production (`npm run build`).
2. **`backend-ci` :** PHP 8.4, Composer install, Pint style check (`composer lint:test`), SQLite migrations, 413 tests PHPUnit.
3. **`security-checks` :** Recherche de fichiers `.env` commités, audit de motifs de secrets, npm audit, composer validate.
4. **`deploy-production` :** Exécution conditionnelle sur `main` :
   * Audit des secrets via `deploy-guard`.
   * Connexion SSH avec `appleboy/ssh-action@v1.0.3`.
   * `git checkout -f ${{ github.sha }}`.
   * `docker compose build --pull`.
   * Activation du mode maintenance (`php artisan down --retry=60`).
   * `docker compose up -d`.
   * `php artisan migrate --force --no-interaction`.
   * `php artisan config:cache && php artisan route:cache && php artisan view:cache`.
   * Sortie du mode maintenance (`php artisan up`).
   * Vérification de santé automatique (`php artisan hafrose:deploy:status --json`).
   * En cas d'erreur (`trap ERR`), déclenchement d'un rollback automatique sur `PREV_COMMIT`.

---

## 10. Health Checks

| Vérification | URL / Commande | Format de Réponse Attendu | Statut Local |
| :--- | :--- | :--- | :---: |
| **Public Web Health** | `GET /health` | HTTP 200 `{"status":"healthy"}` | ✅ PASS |
| **Public API Health** | `GET /api/health` | HTTP 200 `{"status":"healthy","services":{...}}` | ✅ PASS |
| **Docker DB Health** | `mysqladmin ping -h localhost` | `mysqld is alive` | ✅ PASS |
| **Artisan Status** | `php artisan hafrose:deploy:status` | All checks PASS | ✅ PASS |
| **Artisan Status JSON**| `php artisan hafrose:deploy:status --json` | `{"overall_status":"ok"}` | ✅ PASS |

---

## 11. Stratégie de Rollback

* **Applicatif :** Automatisé dans le script CI/CD SSH via `trap rollback ERR`. Si le build, les migrations ou le health check échouent, le script exécute :
  ```bash
  git checkout -f "$PREV_COMMIT"
  docker compose up -d --build
  docker exec hafrose_backend php artisan up
  ```
* **Base de données :** ⚠️ **Strictement manuelle.** Les rollbacks de migrations destructives ne sont jamais automatisés afin d'éviter toute perte de données. Ils doivent être exécutés via restauration de snapshot ou `php artisan migrate:rollback` ciblé après validation par l'équipe DBA.

---

## 12. Sauvegardes (Backup)

* **Script :** [`deployment/scripts/backup.sh`](file:///c:\Users\DELL\Desktop\Hafrose\deployment\scripts\backup.sh) configuré pour exécuter `php artisan hafrose:backup --detailed` directement ou au sein du conteneur `hafrose_backend`.
* **Commande Artisan :** `php artisan hafrose:backup` (gère la base de données, `storage/app`, les images et la rotation des sauvegardes).
* **Rétention :** 7 jours en local, 4 hebdomadaires, 6 mensuels (selon `backend/.env.example`).
* **Recommandation Prod :** Synchronisation automatique du dossier `/var/www/hafrose/backend/storage/app/backups/` vers un bucket S3 / Cloudflare R2 distant.

---

## 13. Tests & Validations Locales

| Suite de Tests | Commande | Résultat |
| :--- | :--- | :---: |
| **TypeScript** | `npm run typecheck` | ✅ PASS (0 erreur) |
| **ESLint Frontend** | `npm run lint` | ✅ PASS (0 avertissement) |
| **Vite Production Build** | `npm run build` | ✅ PASS (1891 modules transformés) |
| **Laravel Pint** | `composer lint:test` | ✅ PASS (`{"result":"passed"}`) |
| **PHPUnit Test Suite** | `php artisan test` | ✅ **413 passed (1656 assertions)** |

---

## 14. Blockers Restants (Matrice d'Action)

| # | Blocker | Cause | Action Requise | Commande de Validation | Résultat Attendu |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Serveur Ubuntu non provisionné** | Infrastructure matérielle/cloud non commandée ou non démarrée | Provisionner un VPS/Serveur dédié Ubuntu 24.04 LTS | `ssh deploy@<IP> "lsb_release -a"` | `Ubuntu 24.04 LTS` |
| **2** | **GitHub Secret `PROD_SERVER_IP` absent** | Secret non configuré dans les paramètres du repository | Ajouter le secret dans GitHub Actions Settings | Vérifier dans GitHub Actions UI | Secret configuré |
| **3** | **GitHub Secret `PROD_SERVER_USER` absent** | Secret non configuré | Ajouter la valeur `deploy` dans GitHub Secrets | Vérifier dans GitHub Actions UI | Secret configuré |
| **4** | **GitHub Secret `PROD_SSH_PRIVATE_KEY` absent**| Clé privée SSH non générée ou non injectée | Générer paire Ed25519, injecter la clé privée dans GitHub Secrets | Lancer workflow dispatch CI/CD | `deploy-guard` passe à `can_deploy=true` |
| **5** | **DNS `hafrose.com` non résolu** | Enregistrements DNS A non créés chez le registrar | Pointer `hafrose.com`, `www`, `api` vers l'IP réelle | `nslookup hafrose.com 8.8.8.8` | Résolution vers `<PROD_SERVER_IP>` |
| **6** | **Certificats SSL Let's Encrypt absents** | Certbot non encore exécuté sur le serveur | Lancer Certbot autonome sur le serveur et copier dans `deployment/ssl/` | `docker compose exec nginx nginx -t` | `syntax is ok / test is successful` |
| **7** | **Fichier `.env` production non créé** | Sécurité : le fichier ne doit exister que sur l'hôte | Créer `/var/www/hafrose/.env` avec les vrais mots de passe et clés | `test -f /var/www/hafrose/.env && echo OK` | `OK` |
| **8** | **Clé applicative `APP_KEY` non générée** | Fichier `.env` serveur non encore instancié | Exécuter `docker compose run --rm backend php artisan key:generate --show` et copier dans `.env` | `grep "APP_KEY=base64:" /var/www/hafrose/.env` | `APP_KEY=base64:...` |

---

## 15. Certification Finale

Conformément à la règle de validation stricte :
* Le code source, les Dockerfiles, Nginx, la base de données et la CI/CD sont **100% prêts et testés sans aucune régression**.
* L'infrastructure externe réelle (serveur physique, DNS mondial, certificats Let's Encrypt, clés SSH distantes) nécessite des actions manuelles de l'opérateur qui ne peuvent ni ne doivent être inventées ou simulées.

```text
🔴 PRODUCTION — BLOCKED
```

### Prochaines étapes pour l'opérateur :
1. Provisionner l'instance Ubuntu 24.04 LTS et créer l'utilisateur `deploy`.
2. Générer la paire de clés Ed25519 et configurer les 3 secrets GitHub.
3. Renseigner les entrées DNS A pour `hafrose.com`, `www` et `api`.
4. Obtenir les certificats SSL Let's Encrypt et les placer dans `deployment/ssl/`.
5. Renseigner le `.env` de production sur le serveur et lancer le premier `docker compose up -d`.
6. Déclencher le workflow GitHub Actions pour valider le premier Go-Live réel.
