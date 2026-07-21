# Guide de Monitoring & Observabilité de Production — HAFROSE Backend

Ce document décrit l'architecture, la configuration, les services, les endpoints d'administration, la stratégie de journalisation et les règles d'alerte pour le système de Monitoring & Observabilité du backend e-commerce HAFROSE.

---

## 1. Vue d'ensemble et Architecture

Le sous-système de monitoring offre une visibilité temps réel complète sur l'état de l'infrastructure et de l'application HAFROSE en environnement de production.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SystemMonitoringController                         │
└───────────────┬──────────────────────┬──────────────────────┬───────────────┘
                │                      │                      │
                ▼                      ▼                      ▼
┌──────────────────────────────┐┌─────────────┐┌──────────────────────────────┐
│     SystemHealthService      ││   PhpInfo   ││   SystemMetricsService       │
└───────────────┬──────────────┘└─────────────┘└──────────────┬───────────────┘
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       ▼
                       ┌──────────────────────────────┐
                       │  MonitoringDashboardService  │
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                       ┌──────────────────────────────┐
                       │     ProductionLogService     │
                       └──────────────────────────────┘
```

### Composants principaux

1. **`config/monitoring.php`** : Configuration centralisée pilotée par les variables d'environnement.
2. **`SystemHealthService`** : Contrôle actif de santé (Base de données, Cache, Filesystem, Queue, Scheduler, PHP, Serveur, App).
3. **`SystemMetricsService`** : Collecte des métriques quantitatives (CPU, RAM, Disque, DB, Cache, Filesystem, Queue, Scheduler, Performance).
4. **`ProductionLogService`** : Service centralisé de journalisation enrichie (contexte IP, route, méthode, utilisateur, mémoire, temps d'exécution).
5. **`MonitoringMiddleware`** : Mesure de performance à chaque requête HTTP, détection automatique des requêtes lentes et injection d'en-têtes HTTP de debug en local (`X-Request-Time`, `X-Memory`, `X-SQL-Time`, `X-SQL-Queries`).
6. **`MonitoringDashboardService`** : Aggrégation unifiée du statut système, des métriques et détection automatique des alertes.
7. **`SystemMonitoringController`** : Endpoints REST protégés (`auth:sanctum` + `admin`).

---

## 2. Configuration (`config/monitoring.php`)

```php
return [
    'enabled'                  => env('MONITORING_ENABLED', true),
    'health_enabled'           => env('MONITORING_HEALTH_ENABLED', true),
    'metrics_enabled'          => env('MONITORING_METRICS_ENABLED', true),
    'log_channel'              => env('MONITORING_LOG_CHANNEL', 'daily'),
    'slow_request_threshold'   => (int) env('MONITORING_SLOW_REQUEST_THRESHOLD', 1000), // ms
    'slow_query_threshold'     => (int) env('MONITORING_SLOW_QUERY_THRESHOLD', 200),  // ms
    'memory_warning'           => (float) env('MONITORING_MEMORY_WARNING', 80.0),      // %
    'disk_warning'             => (float) env('MONITORING_DISK_WARNING', 80.0),        // %
    'disk_critical'            => (float) env('MONITORING_DISK_CRITICAL', 90.0),       // %
    'cpu_warning'              => (float) env('MONITORING_CPU_WARNING', 80.0),        // %
    'scheduler_monitoring'     => env('MONITORING_SCHEDULER_ENABLED', true),
    'queue_monitoring'         => env('MONITORING_QUEUE_ENABLED', true),
    'cache_monitoring'         => env('MONITORING_CACHE_ENABLED', true),
];
```

### Variables `.env` associées

```ini
MONITORING_ENABLED=true
MONITORING_HEALTH_ENABLED=true
MONITORING_METRICS_ENABLED=true
MONITORING_LOG_CHANNEL=daily
MONITORING_SLOW_REQUEST_THRESHOLD=1000
MONITORING_SLOW_QUERY_THRESHOLD=200
MONITORING_MEMORY_WARNING=80.0
MONITORING_DISK_WARNING=80.0
MONITORING_DISK_CRITICAL=90.0
MONITORING_CPU_WARNING=80.0
MONITORING_SCHEDULER_ENABLED=true
MONITORING_QUEUE_ENABLED=true
MONITORING_CACHE_ENABLED=true
```

---

## 3. Endpoints de l'API Administration

Toutes les routes requièrent un jeton d'authentification Sanctum valide et le rôle Administrateur (`auth:sanctum` + `admin`).

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/system/health` | Contrôle d'état de santé (Health Check) |
| `GET` | `/api/admin/system/metrics` | Métriques quantitatives complètes |
| `GET` | `/api/admin/system/status` | Tableau de bord global + alertes actives |
| `GET` | `/api/admin/system/phpinfo` | Informations environnement PHP & extensions |

---

## 4. Exemples de réponses JSON

### `GET /api/admin/system/health`

```json
{
  "success": true,
  "message": "Rapport de santé récupéré avec succès.",
  "errors": null,
  "data": {
    "status": "healthy",
    "checks": {
      "database": {
        "status": "healthy",
        "driver": "mysql",
        "database": "hafrose",
        "connected": true,
        "response_time_ms": 1.45,
        "connection_count": 5
      },
      "cache": {
        "status": "healthy",
        "store": "database",
        "write_success": true,
        "read_success": true,
        "delete_success": true
      },
      "filesystem": {
        "status": "healthy",
        "details": {
          "storage": { "exists": true, "writable": true, "free_space_mb": 45120.5 },
          "public": { "exists": true, "writable": true, "free_space_mb": 45120.5 },
          "backups": { "exists": true, "writable": true, "free_space_mb": 45120.5 }
        }
      },
      "queue": { "status": "healthy", "pending_jobs": 0, "failed_jobs": 0 },
      "scheduler": { "status": "healthy", "active": true, "last_run": "2026-07-21 19:00:00" },
      "php": { "status": "healthy", "version": "8.5.0", "extensions": { "gd": true, "zip": true, "pdo": true, "openssl": true } },
      "server": { "status": "healthy", "hostname": "web-01", "disk_used_percentage": 35.2 },
      "application": { "status": "healthy", "environment": "production", "laravel_version": "12.0.0" }
    },
    "warnings": [],
    "errors": []
  }
}
```

### `GET /api/admin/system/status` (Tableau de bord & Alertes)

```json
{
  "success": true,
  "message": "Statut système récupéré avec succès.",
  "errors": null,
  "data": {
    "summary": {
      "status": "healthy",
      "active_alerts": 0,
      "php_version": "8.5.0",
      "laravel_version": "12.0.0",
      "environment": "production",
      "timestamp": "2026-07-21T19:35:30Z"
    },
    "health": { ... },
    "metrics": { ... },
    "alerts": []
  }
}
```

---

## 5. Détection Automatique des Alertes

Le système génère des alertes non-bloquantes (sans risque de crash) pour les événements suivants :

1. **`db_unreachable`** (Critical) : Base de données inaccessible.
2. **`cache_unavailable`** (Error) : Opérations de cache échouées.
3. **`disk_critical`** (Critical) : Disque `> 90%`.
4. **`disk_warning`** (Warning) : Disque `> 80%`.
5. **`insufficient_backup_space`** (Warning) : Espace disque libre inférieur au seuil minimal pour sauvegarde (`BACKUP_MIN_DISK_SPACE_MB`).
6. **`low_memory`** (Warning) : Utilisation mémoire PHP supérieure à `80%`.
7. **`scheduler_inactive`** (Warning) : Dernier run du planificateur `> 10 minutes`.
8. **`queue_high_failed_jobs`** (Warning) : Plus de 10 travaux échoués en file d'attente.

Chaque alerte est automatiquement consignée dans le canal de log configuré (`ProductionLogService`).

---

## 6. En-têtes HTTP de Debug (Environnement Non-Production)

En environnement `local` ou `testing`, le middleware `MonitoringMiddleware` attache automatiquement les en-têtes suivants aux réponses HTTP sans altérer le payload :

- `X-Request-Time` : Temps total de traitement de la requête (ex: `45.2ms`).
- `X-Memory` : Pic de mémoire consommée (ex: `14.5MB`).
- `X-SQL-Time` : Durée cumulée des requêtes SQL (ex: `8.1ms`).
- `X-SQL-Queries` : Nombre total de requêtes SQL exécutées (ex: `3`).

---

## 7. Maintenance et Monitoring Opérationnel

- **Clean logs** : Les logs sont automatiquement archivés par le canal `daily` configuré dans Laravel (`storage/logs/laravel-YYYY-MM-DD.log`).
- **Alert Triage** : Consulter régulièrement `/api/admin/system/status` depuis le dashboard d'administration frontend.
- **Fail-safe** : Tous les checks utilisent des blocs try-catch préventifs afin d'éviter qu'une panne d'un sous-système tier n'entraîne le crash de l'API d'observabilité.
