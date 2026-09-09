# HAFROSE — Guide des Opérations & Procédures Locales

> **Document Officiel de Référence — Phase 5.5**  
> **Environnement :** 100% Local Windows (Windows 10 / 11)  
> **Architecture :** Monorepo découplé (Backend Laravel 12 API + Frontend React 19 / Vite SPA)  
> **Ports Officiels :** Frontend : `3000` | Backend : `8000` | MySQL : `3306`

---

## Sommaire

1. [Présentation HAFROSE & Architecture Locale](#1-présentation-hafrose--architecture-locale)
2. [Prérequis Système Réels](#2-prérequis-système-réels)
3. [Procédure d'Installation Initiale Complète](#3-procédure-dinstallation-initiale-complète)
4. [Configuration Backend](#4-configuration-backend)
5. [Configuration Frontend](#5-configuration-frontend)
6. [Démarrage Quotidien Officiel](#6-démarrage-quotidien-officiel)
7. [Vérification Rapide](#7-vérification-rapide)
8. [Health Check Automatisé](#8-health-check-automatisé)
9. [Exécution des Tests](#9-exécution-des-tests)
10. [Sauvegarde Locale Automatisée](#10-sauvegarde-locale-automatisée)
11. [Restauration Locale Pas-à-Pas](#11-restauration-locale-pas-à-pas)
12. [Gestion des Logs & Rétention](#12-gestion-des-logs--rétention)
13. [Méthode Standard de Diagnostic Local](#13-méthode-standard-de-diagnostic-local)
14. [Tableau de Dépannage Courant](#14-tableau-de-dépannage-courant)
15. [Maintenance Préventive & Mises à Jour](#15-maintenance-préventive--mises-à-jour)
16. [Sécurité Locale & Hygiène Git](#16-sécurité-locale--hygiène-git)
17. [Gestion Stricte des Ports](#17-gestion-stricte-des-ports)
18. [Arrêt du Projet & Libération des Ressources](#18-arrêt-du-projet--libération-des-ressources)
19. [Reset Local Contrôlé](#19-reset-local-contrôlé)
20. [Procédure de Rollback](#20-procédure-de-rollback)
21. [Gestion des Incidents Locaux Courants](#21-gestion-des-incidents-locaux-courants)
22. [Bonnes Pratiques Git](#22-bonnes-pratiques-git)
23. [Checklist Avant Modification Importante](#23-checklist-avant-modification-importante)
24. [Procédure de Mise à Jour de Dépendances](#24-procédure-de-mise-à-jour-de-dépendances)
25. [Comptes et Accès Locaux](#25-comptes-et-accès-locaux)
26. [Environnements Locaux](#26-environnements-locaux)
27. [Checklist de Démarrage Quotidien](#27-checklist-de-démarrage-quotidien)
28. [Checklist Avant Livraison / Fin de Phase](#28-checklist-avant-livraison--fin-de-phase)

---

## 1. Présentation HAFROSE & Architecture Locale

**HAFROSE** est une plateforme e-commerce haut de gamme dédiée aux articles de Haute Couture, prêt-à-porter de luxe et accessoires précieux (maroquinerie, bijoux, montres, lunettes, ceintures).

Le projet est conçu selon une architecture découplée (*API-first*), exécutée de façon **strictement locale** sur poste Windows, sans dépendance vis-à-vis d'un quelconque cloud, VPS ou infrastructure hébergée.

### Schéma d'Architecture Locale

```text
┌───────────────────────────────────────────────────────────┐
│              Navigateur Web (Poste Local)                 │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│        Frontend Web SPA (React 19 + TypeScript + Vite)     │
│        URL locale : http://localhost:3000                 │
└─────────────────────────────┬─────────────────────────────┘
                              │ Appels API REST & Proxy /api
                              ▼
┌───────────────────────────────────────────────────────────┐
│           Backend API (Laravel 12 + PHP 8.2+)             │
│           URL locale : http://127.0.0.1:8000              │
│           Healthcheck : http://127.0.0.1:8000/api/health  │
└──────────────┬──────────────┬──────────────┬──────────────┘
               │              │              │
               ▼              ▼              ▼
       ┌──────────────┐┌──────────────┐┌──────────────┐
       │ Base MySQL   ││ Stockage     ││ Fichiers     │
       │ Local : 3306 ││ storage/app  ││ Logs Daily   │
       │ (hafrose)    ││ public/img   ││ 14 jours     │
       └──────────────┘└──────────────┘└──────────────┘
```

- **Frontend SPA** : React 19, TypeScript, Vite 6, Tailwind CSS v3, Axios, TanStack React Query, Zustand, Lucide React.
- **Backend API** : Laravel 12, PHP 8.2+ (8.5.6 supporté), Laravel Sanctum (authentification SPA par token/session), Spatie Permission (RBAC).
- **Base de données relationnelle** : MySQL 8.0 local (port `3306`), base de travail `hafrose`, base de tests isolée `test`.
- **Stockage de médias** : disque local Laravel (`storage/app/public` accessible via le lien symbolique `public/storage`, plus `public/images/`).
- **Journalisation & Monitoring** : Monolog en canal `daily` (rotation 14 jours), masquage automatique des secrets (`SanitizeContextProcessor`), endpoint de santé public `/api/health`.

---

## 2. Prérequis Système Réels

Toutes les versions ci-dessous sont celles **réellement requises et vérifiées** sur l'environnement local Windows hôte.

| Composant | Version minimale requise | Version testée & validée | Commande de vérification |
|---|---|---|---|
| **Système d'exploitation** | Windows 10 (Build 19041+) / Windows 11 | Windows 11 Pro 64-bit | `[System.Environment]::OSVersion.Version` |
| **PHP** | `^8.2` (défini dans `composer.json`) | **8.5.6 (cli)** | `php -v` |
| **Composer** | `2.x` | **2.10-dev** | `composer --version` |
| **Node.js** | `18.x` minimum (`20.x+` recommandé) | **v22.23.0** | `node -v` |
| **npm** | `9.x` minimum | **10.9.8** | `npm -v` |
| **MySQL** | `8.0+` | **MySQL 8.0** (port 3306) | `Test-NetConnection 127.0.0.1 -Port 3306` |
| **PowerShell** | `5.1+` | **PowerShell 5.1 / 7.x** | `$PSVersionTable.PSVersion` |
| **Git** | `2.x` | **2.x** | `git --version` |

### Extensions PHP indispensables (activées dans `php.ini`) :
- `pdo_mysql`, `mysqli`, `curl`, `mbstring`, `openssl`, `fileinfo`, `gd`, `zip`, `xml`, `bcmath`.

---

## 3. Procédure d'Installation Initiale Complète

Cette procédure décrit l'installation pas-à-pas à partir d'un clone vierge du dépôt.

### Étape 3.1 — Cloner le Dépôt
Ouvrez une console PowerShell sur votre machine :
```powershell
git clone <url-du-depot> Hafrose
cd Hafrose
```

### Étape 3.2 — Initialisation de la Base de Données MySQL
Assurez-vous que votre service MySQL local est démarré sur le port 3306, puis créez les bases de données locale et de test :
```sql
CREATE DATABASE IF NOT EXISTS `hafrose` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Étape 3.3 — Installation et Configuration du Backend
```powershell
cd backend

# 1. Installer les dépendances PHP
composer install

# 2. Créer le fichier d'environnement local
Copy-Item .env.example .env

# 3. Générer la clé d'application chiffrée
php artisan key:generate

# 4. Configurer les accès MySQL dans backend/.env (si mot de passe root défini)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=hafrose
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Créer le lien symbolique pour les fichiers multimédias
php artisan storage:link

# 6. Exécuter les migrations et le jeu d'essai complet
php artisan migrate --seed

# 7. Retourner à la racine
cd ..
```

### Étape 3.4 — Installation et Configuration du Frontend
```powershell
cd frontend

# 1. Installer les dépendances Node.js
npm install

# 2. Créer le fichier d'environnement local
Copy-Item .env.example .env

# 3. Vérifier les binaires Playwright pour les tests E2E
npx playwright install chromium

# 4. Retourner à la racine
cd ..
```

---

## 4. Configuration Backend

Le backend est configuré par le fichier `backend/.env`. Le fichier `backend/.env.example` sert de modèle pour toute nouvelle installation.

> [!CAUTION]
> **Protection absolue des secrets :** Ne commitez **JAMAIS** `backend/.env`. Les clés de production, mots de passe de bases et tokens privés doivent rester confinés sur votre machine locale.

### Variables Essentielles du Backend

| Variable | Valeur par défaut locale | Rôle / Sensibilité |
|---|---|---|
| `APP_NAME` | `Hafrose` | Nom public de l'application |
| `APP_ENV` | `local` | Mode d'exécution (`local` active les outils de diagnostic) |
| `APP_KEY` | `base64:...` | Clé secrète maîtresse de chiffrement AES-256 (**CRITIQUE**) |
| `APP_DEBUG` | `true` | Active les pages d'erreur détaillées en local (**SENSIBLE**) |
| `APP_URL` | `http://localhost:8000` | URL locale officielle de l'API |
| `DB_CONNECTION` | `mysql` | Moteur de base de données |
| `DB_HOST` | `127.0.0.1` | Hôte local MySQL |
| `DB_PORT` | `3306` | Port officiel MySQL local |
| `DB_DATABASE` | `hafrose` | Nom de la base locale de développement |
| `DB_USERNAME` | `root` | Utilisateur local MySQL |
| `DB_PASSWORD` | *(vide ou secret local)* | Mot de passe local MySQL (**CONFIDENTIEL**) |
| `LOG_CHANNEL` | `daily` | Canal de journalisation Monolog quotidien |
| `LOG_LEVEL` | `debug` | Seuil de sévérité des logs en développement |
| `LOG_DAILY_DAYS` | `14` | Nombre de jours de rétention automatique des logs |
| `BACKUP_ENABLED` | `true` | Active le système de sauvegarde locale |
| `BACKUP_PATH` | `backups` | Répertoire cible (dans `storage/app/backups`) |
| `BACKUP_RETENTION_DAYS` | `30` | Politique de purge des anciennes archives |
| `HONEYPOT_ENABLED` | `true` | Protection anti-bot locale transparente |
| `TURNSTILE_ENABLED` | `false` (local) / `true` | CAPTCHA Cloudflare (désactivé automatiquement en test) |

---

## 5. Configuration Frontend

Le frontend réside dans le répertoire `frontend/` et utilise Vite 6.

### Variables d'Environnement (`frontend/.env`)

```ini
# URL de base de l'API REST Laravel (port officiel 8000)
VITE_API_BASE_URL=http://localhost:8000/api

# URL de distribution des médias publics
VITE_STORAGE_URL=http://localhost:8000/storage

# Environnement applicatif frontend
VITE_APP_ENV=development
```

> [!WARNING]
> **Rappel de sécurité frontend :**  
> Toutes les variables préfixées par `VITE_*` sont compilées et incorporées directement dans le code JavaScript délivré au navigateur. **Aucun secret serveur, clé privée ou mot de passe ne doit figurer dans le frontend.**

### Configuration Réseau & Proxy (`vite.config.ts`)
Le serveur de développement est configuré pour écouter strictement sur le port **3000** :
- `server.port`: `3000`
- `server.strictPort`: `true` (échoue immédiatement si le port 3000 est occupé, évitant les bascules silencieuses vers d'autres ports)
- `server.proxy`: redirige `/api` vers `http://127.0.0.1:8000`

---

## 6. Démarrage Quotidien Officiel

Pour démarrer HAFROSE chaque jour, ouvrez **deux terminaux PowerShell distincts**.

### Terminal 1 — Backend API (Port 8000)
```powershell
cd c:\Users\DELL\Desktop\Hafrose\backend
php artisan serve --port=8000
```
*Le serveur local démarre sur `http://127.0.0.1:8000`.*

### Terminal 2 — Frontend SPA (Port 3000)
```powershell
cd c:\Users\DELL\Desktop\Hafrose\frontend
npm run dev
```
*Le serveur Vite démarre sur `http://localhost:3000`.*

---

## 7. Vérification Rapide

Une fois les deux terminaux lancés, validez immédiatement le bon fonctionnement dans votre navigateur ou via PowerShell :

1. **Frontend Web :** `http://localhost:3000`  
   *Résultat attendu :* Page d'accueil HAFROSE Haute Couture chargée avec statut HTTP 200.
2. **Backend API :** `http://127.0.0.1:8000`  
   *Résultat attendu :* Réponse Laravel.
3. **Contrôle de Santé :** `http://127.0.0.1:8000/api/health`  
   *Résultat attendu :*
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-09-09T17:00:00+01:00",
     "services": {
       "application": "ok",
       "database": "ok",
       "storage": "ok",
       "logs": "ok",
       "cache": "ok"
     }
   }
   ```

---

## 8. Health Check Automatisé

Le script PowerShell officiel `scripts/health-check.ps1` effectue une inspection exhaustive de l'environnement local en 6 étapes séquentielles.

### Commande d'Exécution
```powershell
# Exécution standard
powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1

# Exécution avec affichage détaillé
powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1 -Detailed

# Paramètres personnalisables (options réelles)
powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1 -BackendUrl "http://127.0.0.1:8000" -FrontendUrl "http://localhost:3000" -DbPort 3306
```

### Grille d'Analyse des 6 Étapes
1. **Prérequis Système & Runtimes** : Contrôle des exécutables PHP (>= 8.2), Composer, Node.js et npm.
2. **Base de Données MySQL** : Test d'écoute TCP sur le port 3306 et exécution réelle d'une requête `SELECT 1` via Eloquent/PDO.
3. **Backend API Laravel** : Test du port 8000 et interrogation HTTP de l'endpoint `/api/health`.
4. **Frontend Web Application** : Test d'écoute TCP sur le port 3000 et contrôle de la réponse HTTP 200 du serveur Vite.
5. **Stockage & Permissions Locales** : Test d'écriture/suppression de sondes temporaires dans `storage/`, `storage/logs/`, `storage/framework/cache/`, `storage/framework/views/`, `bootstrap/cache/`.
6. **Système de Logs & Rétention** : Présence du log actif du jour, calcul du volume cumulé (alerte si > 50 Mo) et présence du fichier `.gitignore`.

### Interprétation des Statuts & Codes de Sortie
- `[PASS]` (Vert) : Contrôle 100% conforme.
- `[WARN]` (Jaune) : Service fonctionnel mais attention requise (ex. volume des logs > 50 Mo). Sortie code `0`.
- `[FAIL]` (Rouge) : Défaillance bloquante d'un composant critique (ex. MySQL non démarré). Sortie code `1`.

---

## 9. Exécution des Tests

HAFROSE dispose d'une couverture de tests automatisés couvrant les couches unitaire, fonctionnelle, sécuritaire et end-to-end.

### 9.1 Tests Backend PHPUnit
```powershell
cd backend
php artisan test
```
*Couverture :* 432 tests, 1742 assertions, 0 échec (durée ~60s).  
*Environnement :* Exécution sous `APP_ENV=testing` utilisant la base locale isolée `test`.

### 9.2 Test Spécifique d'Audit de Sécurité
```powershell
cd backend
php artisan test --filter=SecurityAuditTest
```
*Validation :* 7 tests critiques garantissant la conformité CORS sur le port 3000, Sanctum, RBAC administrateur, isolation du stockage, assainisseur d'entrées XSS, masquage des secrets dans les logs et rotation Monolog daily.

### 9.3 Vérifications Qualité Frontend
```powershell
cd frontend

# Contrôle strict des types TypeScript
npm run typecheck

# Analyse statique ESLint (zéro warning toléré)
npm run lint

# Validation de la compilation de production Vite
npm run build
```

### 9.4 Tests End-to-End (E2E) Playwright
> [!IMPORTANT]
> Les deux serveurs locaux (Backend :8000 et Frontend :3000) doivent être actifs avant de lancer les tests E2E.

```powershell
cd frontend

# Exécution complète en mode headless
npx playwright test

# Exécution ciblée d'un scénario précis
npx playwright test e2e/purchase-flow.spec.ts
npx playwright test e2e/auth_customer_journey.spec.ts
npx playwright test e2e/admin-auth.spec.ts

# Exécution avec affichage visuel du navigateur
npm run test:e2e:headed
```
*Résultat nominal :* 28 tests validés, 1 test sauté (debug).

---

## 10. Sauvegarde Locale Automatisée

Le système de sauvegarde locale HAFROSE génère des archives autonomes contenant l'intégralité des données nécessaires à une restauration complète à l'identique.

### Composants Inclus dans une Archive :
1. **Dump complet MySQL** : schéma DDL et données DML de la base locale (`database/database.sql`).
2. **Médias & Uploads persistants** : répertoire `backend/storage/app/public/`.
3. **Images publiques de l'application** : répertoire `backend/public/images/`.
4. **Fichiers de configuration assainis** : `composer.json`, `.env.example`, `.env.sanitized` (mots de passe et clés sensibles remplacés par `********`).
5. **Manifeste standardisé (`manifest.json`)** : horodatage ISO 8601, commit Git, version de Laravel, inventaire des tables, et empreinte cryptographique SHA-256 de chaque fichier.

### Emplacement des Archives :
`backend/storage/app/backups/hafrose-backup_YYYY-MM-DD_HH-mm-ss.zip`

### Commandes Disponibles :

| Action | Commande Artisan | Script PowerShell Windows |
|---|---|---|
| **Créer une sauvegarde complète** | `php artisan hafrose:backup --detailed` | `.\scripts\backup.ps1` |
| **Simuler sans écrire (Dry-Run)** | `php artisan hafrose:backup --dry-run` | `.\scripts\backup.ps1 -DryRun` |
| **Forcer la sauvegarde** | `php artisan hafrose:backup --force` | `.\scripts\backup.ps1 -Force` |
| **Lister les sauvegardes existantes** | `php artisan hafrose:backup:list` | *(utilise Artisan)* |
| **Vérifier l'intégrité de la dernière**| `php artisan hafrose:backup:verify --latest`| `.\scripts\verify-backup.ps1 -Latest` |
| **Vérifier une archive spécifique** | `php artisan hafrose:backup:verify <backup_id>` | `.\scripts\verify-backup.ps1 -BackupId <backup_id>` |

---

## 11. Restauration Locale Pas-à-Pas

La restauration locale permet de recouvrer un état sain à partir de n'importe quelle archive valide créée précédemment.

### 11.1 Protocole Avant Restauration (Obligatoire)
1. **Identifier le besoin :** incident local, corruption de données ou test de non-régression.
2. **Lister les sauvegardes disponibles :** `php artisan hafrose:backup:list`.
3. **Auditer l'intégrité de la sauvegarde cible :**  
   `php artisan hafrose:backup:verify <backup_id>`.
4. **Créer une sauvegarde de sécurité préalable de l'état actuel :**  
   `.\scripts\backup.ps1`.
5. **Effectuer un essai à blanc (Dry-Run) :**  
   `.\scripts\restore.ps1 -BackupId <backup_id> -DryRun`.

### 11.2 Commandes de Restauration

```powershell
# 1. Restauration interactive (liste de choix numérotée avec confirmation)
php artisan hafrose:restore

# 2. Restauration d'une archive spécifique
php artisan hafrose:restore hafrose-backup_2026-09-09_14-23-09

# 3. Restauration vers une base de données de test isolée (recommandé pour validation)
php artisan hafrose:restore hafrose-backup_2026-09-09_14-23-09 --target-db=hafrose_restore_test --force

# 4. Via le script PowerShell Windows
.\scripts\restore.ps1 -BackupId hafrose-backup_2026-09-09_14-23-09

# 5. Restauration partielle ciblée (options réelles)
php artisan hafrose:restore <backup_id> --no-db       # Restaure uniquement storage et images
php artisan hafrose:restore <backup_id> --no-storage  # Restaure la base sans écraser storage
php artisan hafrose:restore <backup_id> --no-images   # Restaure la base sans écraser les images
```

### 11.3 Protocole Après Restauration
1. Recharger le schéma si nécessaire : `php artisan migrate --status`.
2. Vérifier le lien de stockage : `php artisan storage:link`.
3. Vider les caches applicatifs : `php artisan cache:clear; php artisan config:clear`.
4. Contrôler la santé : `powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1`.
5. Exécuter les tests de non-régression : `php artisan test`.

---

## 12. Gestion des Logs & Rétention

### Architecture de Journalisation
- **Répertoire :** `backend/storage/logs/`
- **Fichiers :** `laravel-YYYY-MM-DD.log` (rotation quotidienne automatique Monolog).
- **Rétention :** 14 jours par défaut (`LOG_DAILY_DAYS=14`).
- **Niveaux RFC 5424 supportés :** `DEBUG`, `INFO`, `NOTICE`, `WARNING`, `ERROR`, `CRITICAL`, `ALERT`, `EMERGENCY`.

### Masquage Automatique des Données Confidentielles (`SanitizeContextProcessor`)
Tout événement inscrit dans les journaux passe par un processeur de nettoyage Monolog :
- Champs sensibles (`password`, `password_confirmation`, `token`, `api_key`, `secret`, `cvv`, `card_number`, `app_key`) -> masqués sous la forme `[REDACTED]`.
- En-têtes HTTP `Authorization: Bearer ...` -> masqués sous la forme `Bearer [REDACTED]`.
- Tokens d'authentification Sanctum (`442|GshHwgQ...`) -> `[REDACTED_SANCTUM_TOKEN]`.
- Numéros de carte bancaire -> `[REDACTED_CARD]`.

### Commande de Nettoyage Manuel des Logs Obsolètes
```powershell
# Simulation du nettoyage (Dry-Run)
php artisan hafrose:logs:clean --dry-run

# Purge réelle avec rétention de 14 jours
php artisan hafrose:logs:clean --force

# Purge avec seuil de rétention personnalisé (ex. 7 jours)
php artisan hafrose:logs:clean --days=7 --force
```

> [!NOTE]
> Le fichier de configuration `storage/logs/.gitignore` est expressément protégé et ne sera **jamais** supprimé par la commande de nettoyage.

---

## 13. Méthode Standard de Diagnostic Local

En cas d'anomalie ou de comportement inattendu, appliquez rigoureusement l'arbre de décision en 7 étapes :

```text
               ┌───────────────────────────────┐
               │    Comportement Inattendu     │
               └───────────────┬───────────────┘
                               │
                               ▼
               ┌───────────────────────────────┐
               │ 1. Exécuter health-check.ps1  │
               └───────────────┬───────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
        [Composant FAIL]                [Tous PASS / WARN]
               │                               │
               ▼                               ▼
  ┌────────────────────────┐      ┌────────────────────────┐
  │ Consulter le composant │      │ 2. Examiner les logs   │
  │ identifié dans le      │      │ du jour :              │
  │ tableau de bord        │      │ storage/logs/laravel-*.│
  └────────────────────────┘      └────────────┬───────────┘
                                               │
                                               ▼
                                  ┌────────────────────────┐
                                  │ 3. Tester l'API        │
                                  │ GET /api/health        │
                                  └────────────┬───────────┘
                                               │
                                               ▼
                                  ┌────────────────────────┐
                                  │ 4. Vérifier Frontend   │
                                  │ Console DevTools       │
                                  └────────────┬───────────┘
                                               │
                                               ▼
                                  ┌────────────────────────┐
                                  │ 5. Vérifier la BDD     │
                                  │ php artisan tinker     │
                                  └────────────┬───────────┘
                                               │
                                               ▼
                                  ┌────────────────────────┐
                                  │ 6. Vérifier le Storage │
                                  │ php artisan storage:link
                                  └────────────┬───────────┘
                                               │
                                               ▼
                                  ┌────────────────────────┐
                                  │ 7. Lancer la suite     │
                                  │ php artisan test       │
                                  └────────────────────────┘
```

---

## 14. Tableau de Dépannage Courant

| Symptôme / Problème | Cause Racine Probable | Procédure de Résolution Vérifiée |
|---|---|---|
| **Frontend inaccessible sur `localhost:3000`** | Serveur Vite non démarré ou port 3000 verrouillé par un processus tiers. | 1. Exécuter `netstat -ano \| findstr :3000` pour repérer le PID.<br>2. Arrêter le processus (`taskkill /PID <PID> /F`).<br>3. Relancer `npm run dev` dans `frontend/`. |
| **Backend inaccessible sur `127.0.0.1:8000`** | Serveur PHP Artisan non actif ou port 8000 occupé. | 1. Exécuter `netstat -ano \| findstr :8000`.<br>2. Relancer `php artisan serve --port=8000` dans `backend/`. |
| **Healthcheck retourne HTTP 503 (`unhealthy`)** | Base MySQL injoignable ou dossier `storage/` non inscriptible. | 1. Vérifier le service MySQL (`Test-NetConnection 127.0.0.1 -Port 3306`).<br>2. Vérifier `DB_DATABASE=hafrose` dans `backend/.env`.<br>3. Vérifier les permissions d'écriture de `backend/storage/`. |
| **Connexion Client / Admin impossible (Erreur 401 ou 419)** | Cache de configuration obsolète ou domaine Sanctum non aligné sur le port 3000. | 1. Exécuter `php artisan config:clear; php artisan cache:clear`.<br>2. Vérifier que `SANCTUM_STATEFUL_DOMAINS` inclut bien `localhost:3000` et `127.0.0.1:3000`. |
| **Images de produits non affichées (404 Not Found)** | Lien symbolique `public/storage` brisé ou dossiers médias non synchronisés. | 1. Exécuter `php artisan storage:link`.<br>2. Exécuter `php database/scripts/sync_storage_images.php`. |
| **Migration bloquée ou erreur de clé étrangère** | Base corrompue ou migrations exécutées hors ordre. | 1. Sauvegarder la base (`.\scripts\backup.ps1`).<br>2. Exécuter `php artisan migrate:status`.<br>3. Réinitialiser proprement si nécessaire via `php artisan migrate:fresh --seed`. |
| **Échec du build frontend (`npm run build`)** | Erreur de type TypeScript ou directive d'importation manquante. | 1. Lancer `npm run typecheck` pour cibler le fichier exact.<br>2. Résoudre l'incompatibilité de type avant toute compilation. |
| **Échec des tests Playwright E2E** | Un ou deux serveurs locaux éteints lors du lancement du test runner. | 1. Vérifier que Terminal 1 (`php artisan serve --port=8000`) et Terminal 2 (`npm run dev`) répondent.<br>2. Relancer `npx playwright test`. |

---

## 15. Maintenance Préventive & Mises à Jour

### 15.1 Audits de Vulnérabilités Locaux
À exécuter régulièrement de manière non destructive :
```powershell
# Audit des dépendances PHP
cd backend
composer audit

# Audit des dépendances JavaScript
cd ../frontend
npm audit
npm outdated
```

### 15.2 Règles Strictes de Maintenance
- **Interdiction absolue** d'exécuter `npm audit fix --force` : cette commande introduit des montées de version majeure non testées brisant l'arbre React/Vite.
- **Interdiction** d'exécuter `composer update` sans liste de paquets ciblée et sans validation préalable sur branche Git dédiée.
- **Sauvegarde obligatoire** (`.\scripts\backup.ps1`) avant toute modification des fichiers `package.json` ou `composer.json`.

---

## 16. Sécurité Locale & Hygiène Git

Bien que le projet soit exclusivement local, les règles de sécurité d'un environnement professionnel sont intégralement appliquées :

1. **Étanchéité des Fichiers de Configuration :**  
   Les fichiers `.env` et `.env.local` sont strictement ignorés par Git.
2. **Étanchéité des Sauvegardes & Dumps SQL :**  
   Le dossier `backend/storage/app/backups/*` et les fichiers `*.sql`, `*.dump` sont listés dans `.gitignore`.
3. **Étanchéité des Fichiers de Logs :**  
   Les fichiers `backend/storage/logs/*.log` ne sont jamais versionnés.
4. **CORS Restreint :**  
   Le backend n'autorise que les requêtes originaires de `http://localhost:3000` et `http://127.0.0.1:3000`. L'usage du wildcard (`*`) est formellement interdit en environnement avec identifiants (cookies / Bearer).
5. **Authentification & Permissions :**  
   Protection des routes `/api/admin/*` par middleware Sanctum et vérification stricte du rôle administrateur Spatie.
6. **Protection contre les Injections & XSS :**  
   Nettoyage systématique des entrées par `InputSanitizerMiddleware` (suppression des balises `<script>`, attributs inline d'exécution et caractères nuls).

Vérification d'hygiène Git :
```powershell
git status --short
git ls-files | Select-String -Pattern "(\.env$|\.log$|backups/|\.sql$)"
# Ce contrôle doit impérativement ne retourner AUCUN résultat.
```

---

## 17. Gestion Stricte des Ports

La configuration réseau de HAFROSE est unifiée et immuable :

| Service | Port Officiel | Adresse d'écoute | Note de conformité |
|---|---|---|---|
| **Frontend Web** | **3000** | `http://localhost:3000` | Port unique et officiel (Vite & Playwright) |
| **Backend API** | **8000** | `http://127.0.0.1:8000` | Port officiel du serveur Laravel Artisan |
| **MySQL Local** | **3306** | `127.0.0.1:3306` | Port standard du moteur relationnel |

> [!CAUTION]
> **Port 5173 Obsolète :** Le port 5173 (port par défaut d'installations Vite standard) ne doit plus jamais être utilisé, ni dans les configurations, ni dans les scripts, ni dans la documentation.

---

## 18. Arrêt du Projet & Libération des Ressources

### Arrêt Standard
Dans chacun des terminaux actifs (Terminal 1 et Terminal 2), effectuez :
```text
Ctrl + C
```
Confirmez l'arrêt si l'invite Windows le demande (`O` ou `Y`).

### Arrêt Forcé en Cas de Processus Orphelin
Si un terminal a été fermé abruptement sans libérer le port :
```powershell
# Libérer le port 8000 (Backend)
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Libérer le port 3000 (Frontend)
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## 19. Reset Local Contrôlé

> [!CAUTION]
> **⚠️ PROCÉDURE DESTRUCTIVE :** Cette opération réinitialise intégralement la base de données locale et écrase les modifications de données. Effectuez impérativement une sauvegarde préalable avant de lancer cette commande.

Si l'environnement de développement nécessite une réinitialisation complète à l'état usine :

```powershell
# 1. Sauvegarde préventive de sécurité
.\scripts\backup.ps1

# 2. Réinitialisation complète de la base de données et re-seeding
cd backend
php artisan migrate:fresh --seed

# 3. Réalignement des médias publics et des liens symboliques
php artisan storage:link
php database/scripts/sync_storage_images.php

# 4. Nettoyage des caches système
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Diagnostic de validation
cd ..
powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1
```

---

## 20. Procédure de Rollback

En cas de mise à jour défaillante, d'erreur humaine ou de corruption de données :

1. **Stopper immédiatement les serveurs :** `Ctrl + C` sur les terminaux 1 et 2.
2. **Constater l'anomalie :** consulter `storage/logs/laravel-*.log` et la sortie de `git status`.
3. **Sélectionner la dernière sauvegarde valide :** `php artisan hafrose:backup:list`.
4. **Vérifier l'intégrité de la sauvegarde cible :**  
   `php artisan hafrose:backup:verify <backup_id>`.
5. **Effectuer un dry-run de restauration :**  
   `php artisan hafrose:restore <backup_id> --dry-run`.
6. **Lancer la restauration complète :**  
   `php artisan hafrose:restore <backup_id> --force`.
7. **Nettoyer les caches applicatifs :**  
   `php artisan config:clear; php artisan cache:clear`.
8. **Vérifier l'état de l'environnement :**  
   `powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1`.
9. **Exécuter la suite de tests de validation :**  
   `php artisan test`.
10. **Redémarrer les serveurs locaux** et reprendre l'activité normale.

---

## 21. Gestion des Incidents Locaux Courants

### Incident 1 — Base de Données Inaccessible
- **Symptôme :** Erreur PDO `Connection refused` ou code HTTP 503.
- **Action :** 
  1. Vérifier si le service MySQL est démarré (`services.msc` sous Windows).
  2. Vérifier la connectivité : `Test-NetConnection 127.0.0.1 -Port 3306`.
  3. Vérifier les identifiants dans `backend/.env`.

### Incident 2 — Médias Manquants ou Liens Cassés
- **Symptôme :** Les images des articles affichent une image brisée dans le catalogue.
- **Action :**
  1. Recréer le lien symbolique : `php artisan storage:link`.
  2. Lancer le script de synchronisation d'images d'origine : `php database/scripts/sync_storage_images.php`.

### Incident 3 — Échec de Build Frontend suite à Conflit de Cache
- **Symptôme :** `npm run build` échoue avec une erreur obscure de module introuvable.
- **Action :**
  1. Supprimer le cache Vite et le build précédent : `Remove-Item -Recurse -Force frontend/dist, frontend/node_modules/.vite`.
  2. Relancer la compilation : `npm run build`.

---

## 22. Bonnes Pratiques Git

Pour maintenir l'intégrité du dépôt :
- Toujours vérifier les modifications en attente avant d'ajouter des fichiers : `git status`.
- Toujours inspecter les différences avant de commiter : `git diff`.
- Ne jamais ajouter aveuglément tout le contenu avec `git add .` sans avoir vérifié qu'aucun fichier `.env`, `.log`, ou archive `.zip` n'est présent.
- Toujours valider les tests avant de commiter : `php artisan test` et `npm run typecheck`.

---

## 23. Checklist Avant Modification Importante

Avant d'apporter une modification structurante au code :

```text
[ ] 1. Vérifier l'état Git : git status (espace de travail propre)
[ ] 2. Créer une sauvegarde locale : .\scripts\backup.ps1
[ ] 3. Vérifier l'intégrité de la sauvegarde : .\scripts\verify-backup.ps1 -Latest
[ ] 4. Effectuer les modifications de code nécessaires
[ ] 5. Lancer les tests unitaires et fonctionnels backend : php artisan test
[ ] 6. Lancer l'audit de sécurité automatisé : php artisan test --filter=SecurityAuditTest
[ ] 7. Lancer le contrôle de types TypeScript : npm run typecheck
[ ] 8. Lancer l'analyse statique ESLint : npm run lint
[ ] 9. Lancer la compilation de production : npm run build
[ ] 10. Lancer la suite E2E Playwright : npx playwright test
[ ] 11. Exécuter le health-check : powershell -File scripts\health-check.ps1
[ ] 12. Vérifier l'absence de fichiers sensibles non désirés : git status
```

---

## 24. Procédure de Mise à Jour de Dépendances

Appliquer une démarche conservatrice stricte :
1. **Audit initial :** `composer audit` et `npm audit`.
2. **Création d'une sauvegarde locale complète :** `.\scripts\backup.ps1`.
3. **Mise à jour ciblée d'un seul paquet mineur/patch :**  
   Exemple : `composer update vendor/package --with-dependencies` ou `npm update package_name`.
4. **Validation complète de la suite de tests :**  
   `php artisan test` et `npx playwright test`.
5. **Validation de la compilation frontend :** `npm run build`.
6. **Contrôle de santé :** `powershell -File scripts\health-check.ps1`.
7. **Commit atomique isolé.**

---

## 25. Comptes et Accès Locaux

Les comptes d'accès pré-configurés pour l'environnement local sont générés lors du seeding initial :

| Rôle applicatif | Adresse E-mail | Mot de passe | Permissions associées |
|---|---|---|---|
| **Super Administrateur** | `admin@hafrose.com` | `Admin@Hafrose2024!` | Accès complet au back-office (`/admin`), gestion catalogue, commandes, utilisateurs, logs, paramètres système. |
| **Client Standard** | `client@hafrose.com` | `Secret123!` | Accès à l'espace client (`/account`), historique des commandes, liste d'envies, profil. |
| **Client Test E2E** | `client.test@hafrose.com` | `password` | Compte dédié aux tests automatisés Playwright (créé en environnement `testing`). |

> [!NOTE]
> Les comptes de test avec mots de passe génériques sont strictement cloisonnés à l'environnement local et refusent formellement de s'exécuter si `APP_ENV=production`.

---

## 26. Environnements Locaux

Le projet gère deux environnements locaux distincts :

1. **Environnement de Développement Local (`APP_ENV=local`) :**
   - Base de données : `hafrose`
   - Cache : `database` ou `file`
   - Debug : `true` (messages d'erreurs détaillés)
   - Logs : canal `daily`, niveau `debug`
   - Point d'accès : `http://localhost:3000` et `http://127.0.0.1:8000`

2. **Environnement de Test Automatisé (`APP_ENV=testing`) :**
   - Configuré dans `backend/phpunit.xml`
   - Base de données isolée : `test`
   - Cache et sessions en mémoire (`array`)
   - Turnstile désactivé (`TURNSTILE_ENABLED=false`)
   - Mailer en mémoire (`array`)

---

## 27. Checklist de Démarrage Quotidien

À exécuter chaque matin avant de commencer le travail :

```text
[ ] 1. Vérifier que MySQL écoute sur le port 3306 (Test-NetConnection 127.0.0.1 -Port 3306)
[ ] 2. Terminal 1 : Lancer le Backend (cd backend; php artisan serve --port=8000)
[ ] 3. Terminal 2 : Lancer le Frontend (cd frontend; npm run dev)
[ ] 4. Accéder à http://localhost:3000 dans le navigateur (Accueil chargée avec succès)
[ ] 5. Accéder à http://127.0.0.1:8000/api/health (Réponse JSON {"status":"healthy"})
[ ] 6. Lancer le diagnostic rapide (powershell -File scripts\health-check.ps1)
```

---

## 28. Checklist Avant Livraison / Fin de Phase

Grille de validation finale avant de déclarer une phase achevée :

```text
[ ] 1. Tests backend PHPUnit : 100% PASS (php artisan test)
[ ] 2. Test d'audit de sécurité : 100% PASS (php artisan test --filter=SecurityAuditTest)
[ ] 3. Contrôle TypeScript : 0 erreur (npm run typecheck)
[ ] 4. Analyse ESLint : 0 avertissement, 0 erreur (npm run lint)
[ ] 5. Compilation Vite : Succès (npm run build)
[ ] 6. Tests E2E Playwright : 100% PASS (npx playwright test)
[ ] 7. Contrôle de diagnostic global : 18/18 PASS (powershell -File scripts\health-check.ps1)
[ ] 8. Vérification des ports : Frontend 3000, Backend 8000, MySQL 3306 (0 mention active de 5173)
[ ] 9. Hygiène Git : Aucun fichier .env, aucun log, aucune archive de backup présente dans l'index
[ ] 10. Documentation à jour et conforme à l'état réel du repository
```

---

*HAFROSE — Guide Opérationnel Local Officiel — Validé Phase 5.5*
