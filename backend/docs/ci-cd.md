# 🚀 Infrastructure CI/CD — HAFROSE Enterprise Backend

Document de référence pour l'architecture CI/CD, l'automatisation des tests, l'analyse de code, la sécurité, la gestion des releases et le déploiement continu du backend **HAFROSE** (Laravel 12 / PHP 8.3).

---

## 📑 Sommaire

1. [Vue d'ensemble et Architecture](#1-vue-densemble-et-architecture)
2. [Workflows GitHub Actions](#2-workflows-github-actions)
   - [CI (`ci.yml`)](#ci-ciyml)
   - [Analyse Qualité (`quality.yml`)](#analyse-qualité-qualityyml)
   - [Analyse Sécurité (`security.yml`)](#analyse-sécurité-securityyml)
   - [Déploiement Automatisé (`deploy.yml`)](#déploiement-automatisé-deployyml)
   - [Gestion des Releases (`release.yml`)](#gestion-des-releases-releaseyml)
3. [Configuration & Environnement CI (`.env.ci`)](#3-configuration--environnement-ci-envci)
4. [Scripts Composer](#4-scripts-composer)
5. [Variables & Secrets GitHub](#5-variables--secrets-github)
6. [Procédure de Déploiement](#6-procédure-de-déploiement)
7. [Procédure de Rollback](#7-procédure-de-rollback)
8. [Bonnes Pratiques & Maintenance](#8-bonnes-pratiques--maintenance)

---

## 1. Vue d'ensemble et Architecture

L'infrastructure CI/CD de HAFROSE repose sur **GitHub Actions**, l'exécuteur **Ubuntu Latest**, **PHP 8.3**, **Composer 2**, **Node.js LTS** et une suite d'outils d'analyse statique et dynamique respectant les standards Enterprise Laravel 12.

```
                  ┌──────────────────────────────────────────────┐
                  │                 GIT PUSH / PR                │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
      ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
      │   CI Pipeline       │ │  Quality Analysis   │ │  Security Analysis  │
      │   (ci.yml)          │ │  (quality.yml)      │ │  (security.yml)     │
      └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │              WORKFLOW DISPATCH               │
                  │             TAG RELEASE (v1.x.x)             │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
      ┌─────────────────────┐                         ┌─────────────────────┐
      │  Release Pipeline   │                         │  Deploy Pipeline    │
      │  (release.yml)      │                         │  (deploy.yml)       │
      └─────────────────────┘                         └─────────────────────┘
```

---

## 2. Workflows GitHub Actions

Tous les workflows se trouvent dans le répertoire `.github/workflows/`.

### CI (`ci.yml`)
- **Déclencheurs** : `push` et `pull_request` sur les branches `main` et `develop`.
- **Fonctions** :
  1. Checkout du code via `actions/checkout@v4`.
  2. Configuration de PHP 8.3 avec les extensions requises (`mbstring`, `pdo_mysql`, `pdo_sqlite`, `openssl`, `gd`, `zip`, `redis`, `bcmath`, `ctype`, `json`, `xml`, etc.).
  3. Mise en cache des dépendances Composer et modules NPM.
  4. Compilation des assets frontend (`npm run build`).
  5. Copie de `.env.ci` et génération de la clé d'application `APP_KEY`.
  6. Migration de la base SQLite en mémoire (`database/database.sqlite`).
  7. Exécution des tests automatisés avec PHPUnit / Artisan Test (`php artisan test`).
  8. Génération et publication des rapports d'exécution JUnit et du code coverage (Codecov).

### Analyse Qualité (`quality.yml`)
- **Déclencheurs** : `push` et `pull_request` sur `main` et `develop`.
- **Vérifications** :
  1. **Laravel Pint** (`vendor/bin/pint --test`) : Respect des normes PSR-12 et style Laravel.
  2. **PHPStan / Larastan** (`vendor/bin/phpstan analyse app`) : Analyse statique de code sans exécution.
  3. **Composer Validate** (`composer validate`) : Intégrité du fichier `composer.json`.
  4. **Composer Audit** (`composer audit`) : Détection des paquets obsolètes ou vulnérables.

### Analyse Sécurité (`security.yml`)
- **Déclencheurs** : `push`, `pull_request` et tâche planifiée quotidienne (`cron: '0 3 * * *'`).
- **Vérifications** :
  1. **Audit Sécurité Composer** (`composer audit`).
  2. **Détection de Secrets** : Recherche de clés API, mots de passe, jetons `.env` ou certificats commités accidentellement dans le dépôt Git.
  3. **Protection .gitignore** : Validation que les fichiers sensibles (`.env`, `storage/`, `vendor/`) sont ignorés.
  4. **Contrôle des Fonctions PHP Sensibles** : Détection des usages d'fonctions à risque (`eval`, `exec`, `system`, etc.).

### Déploiement Automatisé (`deploy.yml`)
- **Déclencheurs** : Manuellement via `workflow_dispatch` ou automatiquement lors d'une publication de `release`.
- **Étapes de Déploiement zéro downtime** :
  1. Passation de l'application en mode maintenance (`php artisan down`).
  2. Mise à jour du code source (`git pull`).
  3. Installation des dépendances de production (`composer install --no-dev`).
  4. Compilation des assets frontend (`npm run build`).
  5. Exécution des migrations de base de données (`php artisan migrate --force`).
  6. Optimisation globale des caches (`php artisan config:cache`, `route:cache`, `view:cache`, `event:cache`).
  7. Sauvegarde post-déploiement de sécurité (`php artisan hafrose:backup`).
  8. Réactivation du service (`php artisan up`).
  9. Rollback automatique en cas d'échec à l'une des étapes.

### Gestion des Releases (`release.yml`)
- **Déclencheurs** : Push de tags de version (ex: `v1.0.0`, `v1.0.1`).
- **Fonctions** :
  1. Génération automatique des notes de version (CHANGELOG) basées sur l'historique des commits.
  2. Création de l'archive de déploiement ZIP de production (`hafrose-backend-vX.Y.Z.zip`).
  3. Création officielle de la GitHub Release avec pièces jointes et documentation.

---

## 3. Configuration & Environnement CI (`.env.ci`)

Le fichier `.env.ci` fournit une configuration dédiée, isolée et sécurisée pour les environnements d'intégration continue :

- **Base de données** : SQLite en mémoire (`DB_CONNECTION=sqlite`).
- **Drivers légers** :
  - `CACHE_STORE=array`
  - `QUEUE_CONNECTION=sync`
  - `MAIL_MAILER=array`
  - `SESSION_DRIVER=array`
- **Protection externe désactivée** : Turnstile CAPTCHA et Honeypot sont désactivés lors des tests pour éviter des faux positifs.

---

## 4. Scripts Composer

Des raccourcis standardisés ont été intégrés dans `composer.json` :

| Commande Composer | Action Exécutée |
| :--- | :--- |
| `composer test` | Lance la suite complète des tests PHPUnit via Artisan |
| `composer analyse` | Analyse statique du code via PHPStan / Larastan |
| `composer lint` | Correction automatique du style de code avec Laravel Pint |
| `composer lint:test` | Vérification du style de code sans modification |
| `composer quality` | Valide le composer.json, l'audit sécurité et le lint |
| `composer ci` | Déclenche localement la séquence d'intégration continue |
| `composer deploy` | Optimise et met en cache la configuration, les routes et les vues |

---

## 5. Variables & Secrets GitHub

Pour configurer les pipelines sur GitHub (`Settings > Secrets and variables > Actions`) :

| Secret | Description | Requis Pour |
| :--- | :--- | :--- |
| `DEPLOY_SSH_KEY` | Clé privée SSH pour la connexion au serveur de production | `deploy.yml` |
| `DEPLOY_HOST` | Adresse IP ou FQDN du serveur de production | `deploy.yml` |
| `DEPLOY_USER` | Utilisateur SSH (ex: `deploy` ou `hafrose`) | `deploy.yml` |
| `DEPLOY_PATH` | Chemin absolu du projet sur le serveur (ex: `/var/www/hafrose`) | `deploy.yml` |
| `MAINTENANCE_SECRET` | Token de contournement de la maintenance (`?secret=XXX`) | `deploy.yml` |
| `CODECOV_TOKEN` | Jeton d'upload des rapports de couverture vers Codecov | `ci.yml` |

---

## 6. Procédure de Déploiement

### Déploiement Manuel (Workflow Dispatch)
1. Se rendre dans l'onglet **Actions** du dépôt GitHub.
2. Sélectionner **🚀 Deploy — HAFROSE Production**.
3. Cliquer sur **Run workflow**, choisir l'environnement (`production` ou `staging`) et cliquer sur **Run**.

### Déploiement Automatique (Release)
Créer et pousser un tag de version semver :
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```
Ceci déclenchera automatiquement la création de la release et la pipeline de déploiement.

---

## 7. Procédure de Rollback

En cas d'incident en production :

### Rollback via GitHub Actions
1. Lancer le workflow **🚀 Deploy — HAFROSE Production**.
2. Cocher la case **Force rollback to previous version**.
3. Le pipeline remettra l'application dans l'état du commit précédent et ré-optimisera le cache.

### Rollback Manuel via SSH
```bash
ssh user@server
cd /var/www/hafrose
php artisan down
git checkout HEAD~1 -- .
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan up
```

---

## 8. Bonnes Pratiques & Maintenance

1. **Ne jamais commiter de secrets** : Toujours utiliser les GitHub Secrets.
2. **Exécuter `composer ci` avant tout Push** : S'assurer que tous les tests et analyses de code passent localement.
3. **Maintien des dépendances** : Exécuter régulièrement `composer audit` et mettre à jour les packages de sécurité.
4. **Vérification des Logs** : Consulter `storage/logs/laravel.log` et les artefacts des workflows en cas de failure CI.
