# Infrastructure de Déploiement & Optimisation Laravel — HAFROSE Backend

Ce document décrit l'architecture, la configuration, le workflow de déploiement, les services d'optimisation et de santé, les commandes Artisan, les API REST d'administration, la journalisation et la maintenance pour le backend Laravel 12 HAFROSE.

---

## 1. Architecture

L'infrastructure de déploiement s'articule autour de services fortement typés, d'une configuration centralisée alimentée par les variables d'environnement, d'une commande Artisan console et d'endpoints d'administration sécurisés.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DeploymentController                             │
└───────────────┬──────────────────────┬──────────────────────┬───────────────┘
                │                      │                      │
                ▼                      ▼                      ▼
┌──────────────────────────────┐┌─────────────┐┌──────────────────────────────┐
│ DeploymentOptimizationService││  AdminLog   ││   DeploymentHealthService    │
└───────────────┬──────────────┘│ ActivityLog │└──────────────┬───────────────┘
                │               └─────────────┘               │
                ▼                                             ▼
┌──────────────────────────────┐               ┌──────────────────────────────┐
│  Artisan (config/route/view) │               │   Validation de l'infra     │
└──────────────────────────────┘               └──────────────────────────────┘
```

### Composants principaux

1. **`config/deployment.php`** : Configuration centralisée pilotée par l'environnement (`APP_ENV`, `APP_DEBUG`, `queue`, `scheduler`, `opcache`, `cache`, `php`, `nginx`, `ssl`, `supervisor`, `flags`).
2. **`DeploymentOptimizationService`** : Orchestration des commandes de cache et d'optimisation via `Artisan::call()` avec mesure fine des temps d'exécution.
3. **`DeploymentHealthService`** : Service d'audit automatique des répertoires inscriptibles (`storage`, `bootstrap/cache`), des caches compilés, d'OPcache, des extensions PHP et des permissions système.
4. **`DeploymentController`** : Contrôleur d'administration REST protégé (`auth:sanctum` + `admin`).
5. **`DeployOptimizeCommand`** (`php artisan hafrose:deploy:optimize`) : Commande CLI professionnelle pour l'exécution d'optimisations et le préchauffage des caches.

---

## 2. Workflow de Déploiement

Un déploiement standard en environnement de production suit les étapes automatisées suivantes :

```
1. Git pull / Checkout version release
2. composer install --no-dev --optimize-autoloader
3. php artisan migrate --force
4. php artisan hafrose:deploy:optimize --clear --warmup --force
5. Supervisor reload (php artisan queue:restart)
6. Verification via GET /api/admin/system/deployment/status
```

---

## 3. Configuration (`config/deployment.php`)

```php
return [
    'env'   => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url'   => env('APP_URL', 'http://localhost'),

    'queue' => [
        'connection'       => env('QUEUE_CONNECTION', 'database'),
        'default_queue'    => env('SQS_QUEUE', 'default'),
        'timeout'          => (int) env('QUEUE_TIMEOUT', 90),
        'max_tries'        => (int) env('QUEUE_MAX_TRIES', 3),
        'worker_processes' => (int) env('QUEUE_WORKERS', 2),
    ],

    'scheduler' => [
        'enabled'      => (bool) env('SCHEDULER_ENABLED', true),
        'run_interval' => env('SCHEDULER_INTERVAL', 'everyMinute'),
        'timezone'     => env('APP_TIMEZONE', 'UTC'),
    ],

    'opcache' => [
        'enabled'               => (bool) env('OPCACHE_ENABLED', true),
        'validate_timestamps'   => (bool) env('OPCACHE_VALIDATE_TIMESTAMPS', false),
        'revalidate_freq'       => (int) env('OPCACHE_REVALIDATE_FREQ', 0),
        'max_accelerated_files' => (int) env('OPCACHE_MAX_ACCELERATED_FILES', 10000),
        'memory_consumption'    => (int) env('OPCACHE_MEMORY_CONSUMPTION', 128),
    ],

    'cache' => [
        'default_store' => env('CACHE_STORE', 'file'),
        'prefix'        => env('CACHE_PREFIX', 'hafrose_cache'),
        'default_ttl'   => (int) env('CACHE_TTL', 3600),
    ],

    'php' => [
        'min_version'        => '8.3.0',
        'memory_limit'       => env('PHP_MEMORY_LIMIT', '512M'),
        'max_execution_time' => (int) env('PHP_MAX_EXECUTION_TIME', 60),
        'display_errors'     => (bool) env('PHP_DISPLAY_ERRORS', false),
    ],

    'nginx' => [
        'worker_processes'     => env('NGINX_WORKER_PROCESSES', 'auto'),
        'client_max_body_size' => env('NGINX_CLIENT_MAX_BODY_SIZE', '20M'),
        'keepalive_timeout'    => (int) env('NGINX_KEEPALIVE_TIMEOUT', 65),
    ],

    'ssl' => [
        'enabled'        => (bool) env('SSL_ENABLED', true),
        'hsts_enabled'   => (bool) env('SSL_HSTS_ENABLED', true),
        'secure_cookies' => (bool) env('SSL_SECURE_COOKIES', true),
    ],

    'supervisor' => [
        'enabled'      => (bool) env('SUPERVISOR_ENABLED', true),
        'process_name' => env('SUPERVISOR_PROCESS_NAME', 'hafrose-worker'),
        'numprocs'     => (int) env('SUPERVISOR_NUMPROCS', 2),
    ],

    'flags' => [
        'maintenance_mode'     => (bool) env('DEPLOY_MAINTENANCE_MODE', false),
        'auto_optimize'        => (bool) env('DEPLOY_AUTO_OPTIMIZE', true),
        'health_check_enabled' => (bool) env('DEPLOY_HEALTH_CHECK_ENABLED', true),
    ],
];
```

---

## 4. Variables `.env`

| Variable | Type | Valeur par défaut | Description |
|---|---|---|---|
| `APP_ENV` | string | `production` | Environnement d'exécution |
| `APP_DEBUG` | bool | `false` | Mode débogage (doit être false en prod) |
| `APP_URL` | string | `https://api.hafrose.com` | URL racine de l'application |
| `QUEUE_CONNECTION` | string | `database` / `redis` | Driver de file d'attente |
| `SCHEDULER_ENABLED` | bool | `true` | Activation du planificateur |
| `OPCACHE_ENABLED` | bool | `true` | Activation d'OPcache |
| `PHP_MEMORY_LIMIT` | string | `512M` | Limite de mémoire PHP |
| `DEPLOY_AUTO_OPTIMIZE` | bool | `true` | Optimisation automatique au déploiement |

---

## 5. Commandes Artisan

```bash
# Optimisation de base
php artisan hafrose:deploy:optimize

# Vider les caches avant d'optimiser
php artisan hafrose:deploy:optimize --clear

# Préchauffer les caches applicatifs après optimisation
php artisan hafrose:deploy:optimize --warmup

# Forcer l'exécution hors environnement de production (dev / staging)
php artisan hafrose:deploy:optimize --clear --warmup --force
```

---

## 6. API d'Administration REST

Toutes les routes requièrent l'en-tête `Authorization: Bearer <sanctum_token>` d'un utilisateur avec le rôle `admin`.

### 1. Statut & Audit de Santé
- **Méthode** : `GET`
- **Route** : `/api/admin/system/deployment/status`
- **Réponse 200** :
```json
{
  "success": true,
  "message": "Statut du déploiement et de santé récupéré avec succès.",
  "data": {
    "health": {
      "overall_status": "ok",
      "checks": {
        "storage_writable": { "status": "ok", "message": "Le répertoire storage...", "recommendation": "Aucune action requise." },
        "bootstrap_cache_writable": { "status": "ok", "message": "...", "recommendation": "..." },
        "config_cache": { "status": "ok", "message": "...", "recommendation": "..." },
        "route_cache": { "status": "ok", "message": "...", "recommendation": "..." },
        "view_cache": { "status": "ok", "message": "...", "recommendation": "..." },
        "event_cache": { "status": "ok", "message": "...", "recommendation": "..." },
        "queue_config": { "status": "ok", "message": "...", "recommendation": "..." },
        "scheduler_config": { "status": "ok", "message": "...", "recommendation": "..." },
        "opcache_status": { "status": "ok", "message": "...", "recommendation": "..." },
        "php_version": { "status": "ok", "message": "...", "recommendation": "..." },
        "required_extensions": { "status": "ok", "message": "...", "recommendation": "..." },
        "permissions": { "status": "ok", "message": "...", "recommendation": "..." }
      },
      "summary": { "total": 12, "ok": 12, "warning": 0, "error": 0 }
    },
    "config": { ... }
  }
}
```

### 2. Optimisation des Caches
- **Méthode** : `POST`
- **Route** : `/api/admin/system/deployment/optimize`
- **Réponse 200** :
```json
{
  "success": true,
  "message": "Optimisation globale réalisée avec succès en 45.2 ms.",
  "data": {
    "success": true,
    "duration": 45.2,
    "message": "Optimisation globale réalisée avec succès...",
    "details": { ... }
  }
}
```

### 3. Vidage des Caches
- **Méthode** : `POST`
- **Route** : `/api/admin/system/deployment/clear`

### 4. Préchauffage des Caches
- **Méthode** : `POST`
- **Route** : `/api/admin/system/deployment/warmup`

---

## 7. Journalisation

Toutes les opérations d'optimisation, de vidage et de préchauffage via API enregistrent des entrées dans :
1. `AdminLog` :
   - Actions : `deployment.optimize`, `deployment.clear`, `deployment.warmup`
   - Ressource : `system`
2. `ActivityLog` :
   - Event Types : `deployment.optimize`, `deployment.clear`, `deployment.warmup`
   - Catégorie : `admin`

---

## 8. Tests

La suite de tests automatisés `DeploymentOptimizationTest.php` couvre 100 % des exigences de déploiement :
- Interdiction 401 pour utilisateurs non authentifiés.
- Interdiction 403 pour utilisateurs non administrateurs.
- Validation du statut 200 et du schéma de réponse de `/system/deployment/status`.
- Validation des actions d'optimisation, vidage et préchauffage des caches.
- Vérification de la création des enregistrements `AdminLog` et `ActivityLog`.
- Validation de la commande Artisan `hafrose:deploy:optimize --force`.

Pour exécuter les tests :
```bash
php artisan test --filter=DeploymentOptimizationTest
```

---

## 9. Maintenance

- **Rotation des logs** : Les logs d'audit d'administration restent immuables.
- **Droit des fichiers** : Les répertoires `storage` et `bootstrap/cache` doivent conserver des privilèges `775` avec le propriétaire `www-data`.
- **Surveillance d'OPcache** : En production, s'assurer que `opcache.validate_timestamps=0` pour maximiser la vitesse tout en réinitialisant OPcache lors des déploiements via `php artisan hafrose:deploy:optimize`.
