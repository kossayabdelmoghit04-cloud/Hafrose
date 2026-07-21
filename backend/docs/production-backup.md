# Documentation — Infrastructure de Production & Sauvegardes HAFROSE

## Vue d'ensemble

Cette documentation détaille l'infrastructure de production et le système de sauvegardes automatisées mis en place pour l'application **HAFROSE (Laravel 12 Backend)** lors de la **Phase 5.8.1**.

Le système assure la sécurité des données, la haute disponibilité et la préparation à la mise en production via :
- La configuration centralisée dédiée (`config/production.php`).
- Le service de sauvegarde complet (`ProductionBackupService`).
- La rotation automatique des sauvegardes (politique 7-4-6).
- Le service de maintenance avancée (`MaintenanceService`).
- La commande Artisan dédiée (`php artisan hafrose:backup`).
- Les APIs d'administration sécurisées et journalisées.

---

## 1. Architecture du Système

```
                               ┌───────────────────────────────────┐
                               │   .env / config/production.php    │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
 ┌──────────────────────────┐    ┌───────────────────────────────────┐    ┌──────────────────────────┐
 │ API Administration       │───►│      ProductionBackupService      │◄───│ Commande Artisan         │
 │ POST   /system/backup    │    ├───────────────────────────────────┤    │ php artisan              │
 │ GET    /system/backups   │    │ • Espace disque min (disk_check)  │    │   hafrose:backup         │
 │ DELETE /system/backups/* │    │ • Mysqldump / Dump SQLite         │    │   [--dry-run]            │
 └─────────────┬────────────┘    │ • Storage/app & Public/images     │    │   [--detailed]           │
               │                 │ • Fichiers critiques (.env…)      │    │   [--force]              │
               ▼                 │ • Compression ZIP horodatée       │    └──────────────────────────┘
 ┌──────────────────────────┐    │ • Rotation 7j / 4w / 6m           │
 │ Journalisation           │    └─────────────────┬─────────────────┘
 │ • AdminLog (admin_logs)  │                      │
 │ • ActivityLog (global)   │                      ▼
 └──────────────────────────┘    ┌───────────────────────────────────┐
                                 │ Storage local / S3                │
                                 │ storage/app/backups/*.zip         │
                                 └───────────────────────────────────┘
```

---

## 2. Configuration (`config/production.php`)

Le fichier `config/production.php` regroupe l'ensemble des paramètres d'infrastructure de production. Toutes les valeurs sont configurables via les variables d'environnement dans le fichier `.env`.

### Structure de la configuration :

```php
return [
    'backup' => [
        'enabled'           => env('BACKUP_ENABLED', true),
        'path'              => env('BACKUP_PATH', 'backups'),
        'database'          => env('BACKUP_DATABASE', true),
        'storage'           => env('BACKUP_STORAGE', true),
        'images'            => env('BACKUP_IMAGES', true),
        'compress'          => env('BACKUP_COMPRESS', true),
        'filename_prefix'   => env('BACKUP_FILENAME_PREFIX', 'hafrose-backup'),
        'min_disk_space_mb' => env('BACKUP_MIN_DISK_SPACE_MB', 500),
        'notify_on_failure' => env('BACKUP_NOTIFY_ON_FAILURE', false),
        'notify_email'      => env('BACKUP_NOTIFY_EMAIL', null),
    ],
    'retention' => [
        'daily'   => env('BACKUP_RETENTION_DAILY', 7),
        'weekly'  => env('BACKUP_RETENTION_WEEKLY', 4),
        'monthly' => env('BACKUP_RETENTION_MONTHLY', 6),
        'days'    => env('BACKUP_RETENTION_DAYS', 30),
    ],
    'compression' => [
        'level'  => env('BACKUP_COMPRESSION_LEVEL', 6),
        'format' => env('BACKUP_COMPRESSION_FORMAT', 'zip'),
    ],
    'maintenance' => [
        'secret'      => env('MAINTENANCE_SECRET', null),
        'allowed_ips' => explode(',', env('MAINTENANCE_ALLOWED_IPS', '')),
        'message'     => env('MAINTENANCE_MESSAGE', 'Le service est temporairement en maintenance.'),
        'retry_after' => env('MAINTENANCE_RETRY_AFTER', 0),
    ],
    'storage' => [
        'disk'      => env('BACKUP_STORAGE_DISK', 'local'),
        'read_only' => env('PRODUCTION_READ_ONLY', false),
    ],
    'health' => [
        'enabled'                => env('HEALTH_CHECK_ENABLED', true),
        'disk_warning_threshold'  => env('HEALTH_DISK_WARNING_THRESHOLD', 85),
        'disk_critical_threshold' => env('HEALTH_DISK_CRITICAL_THRESHOLD', 95),
    ],
    'scheduler' => [
        'enabled'     => env('SCHEDULER_ENABLED', true),
        'backup_time' => env('SCHEDULER_BACKUP_TIME', '02:00'),
        'timezone'    => env('SCHEDULER_TIMEZONE', 'UTC'),
    ],
];
```

---

## 3. Variables d'Environnement (`.env.example`)

Les variables suivantes ont été ajoutées et documentées dans `.env.example` :

| Variable | Description | Valeur par défaut |
|---|---|---|
| `BACKUP_ENABLED` | Activer le système de sauvegarde | `true` |
| `BACKUP_PATH` | Répertoire relatif à `storage/app` | `backups` |
| `BACKUP_DATABASE` | Inclure le dump de la base de données | `true` |
| `BACKUP_STORAGE` | Inclure le répertoire `storage/app` | `true` |
| `BACKUP_IMAGES` | Inclure les images publiques (`public/images`) | `true` |
| `BACKUP_COMPRESS` | Activer la compression ZIP | `true` |
| `BACKUP_COMPRESSION_LEVEL` | Niveau de compression ZIP (0=aucun, 9=max) | `6` |
| `BACKUP_FILENAME_PREFIX` | Préfixe des archives générées | `hafrose-backup` |
| `BACKUP_MIN_DISK_SPACE_MB` | Espace disque minimal requis (en Mo) | `500` |
| `BACKUP_STORAGE_DISK` | Disque de stockage (`local`, `s3`…) | `local` |
| `BACKUP_RETENTION_DAILY` | Nombre de backups journaliers conservés | `7` |
| `BACKUP_RETENTION_WEEKLY` | Nombre de backups hebdomadaires conservés | `4` |
| `BACKUP_RETENTION_MONTHLY` | Nombre de backups mensuels conservés | `6` |
| `BACKUP_RETENTION_DAYS` | Rétention globale par défaut (jours) | `30` |
| `MAINTENANCE_SECRET` | Secret pour bypasser la maintenance (`?secret=XXX`) | `null` |
| `MAINTENANCE_ALLOWED_IPS` | Liste d'IPs autorisées pendant la maintenance | `127.0.0.1` |
| `MAINTENANCE_MESSAGE` | Message affiché lors de la maintenance | `"Le service est en maintenance..."` |
| `MAINTENANCE_RETRY_AFTER` | Temps estimé avant réouverture (secondes) | `0` |
| `PRODUCTION_READ_ONLY` | Activer le mode lecture seule applicatif | `false` |
| `HEALTH_CHECK_ENABLED` | Activer les vérifications de santé système | `true` |
| `SCHEDULER_ENABLED` | Activer le planificateur de tâches | `true` |

---

## 4. Service `ProductionBackupService`

Le service `App\Services\ProductionBackupService` orchestre la totalité du cycle de sauvegarde.

### Responsabilités et méthodes :

1. **`run(bool $dryRun = false, bool $verbose = false): array`** :
   Lance la sauvegarde complète.
   - Vérifie l'activation (`BACKUP_ENABLED`).
   - Effectue un contrôle d'espace disque disponible (`assertDiskSpace`).
   - Crée le répertoire temporaire `storage/app/backups/tmp_{timestamp}`.
   - Génère le dump MySQL via `mysqldump` (ou copie SQLite en environnement de test).
   - Copie les fichiers de `storage/app` (en excluant le dossier `backups/`).
   - Copie les images de `public/images` et `public/storage`.
   - Copie les fichiers critiques de configuration (`.env`, `composer.json`, `phpunit.xml`, `artisan`).
   - Compresse l'ensemble dans une archive ZIP horodatée (`hafrose-backup_YYYY-MM-DD_HH-mm-ss.zip`).
   - Exécute la rotation automatique des anciennes sauvegardes.
   - Nettoie les fichiers temporaires.
   - Retourne un rapport d'exécution structuré.

2. **`rotateBackups(string $backupBasePath, bool $verbose = false): void`** :
   Applique la stratégie de rétention **7-4-6** :
   - Conserve les **7** plus récentes sauvegardes quotidiennes.
   - Conserve le 1er backup de chacune des **4** dernières semaines.
   - Conserve le 1er backup de chacun des **6** derniers mois.
   - Supprime physiquement les archives ne répondant à aucun de ces critères.

3. **`listBackups(): array`** :
   Liste toutes les sauvegardes disponibles dans le stockage avec métadonnées (`id`, `filename`, `size_kb`, `size_human`, `created_at`).

4. **`deleteBackup(string $id): void`** :
   Supprime une sauvegarde spécifique par son identifiant après validation de sécurité.

5. **`restore(string $backupId): array`** :
   Méthode préparée pour la restauration. Fournit la procédure de sécurité en attente d'une intervention manuelle ou d'une automatisation future.

6. **`verifyBackupIntegrity(string $backupId): bool`** :
   Vérifie l'intégrité de la structure ZIP de l'archive via `ZipArchive::CHECKCONS`.

---

## 5. Service `MaintenanceService`

Le service `App\Services\MaintenanceService` gère l'état de maintenance de l'application via les commandes natives Laravel.

### Méthodes clés :

- **`enable(?string $secret, ?array $allowedIps, ?string $message, ?int $retryAfter): array`** : Active le mode maintenance en passant les options à `php artisan down`.
- **`disable(): array`** : Repasse l'application en ligne via `php artisan up`.
- **`enableSecure(): array`** : Active la maintenance en utilisant directement les paramètres définis dans `config/production.php`.
- **`schedule(int $inSeconds, ?string $secret, ?string $message): array`** : Prépare une maintenance différée.
- **`isDown(): bool`** : Retourne `true` si la maintenance est active.
- **`status(): array`** : Retourne un rapport complet sur le statut actuel (avec détails du fichier `down`).

---

## 6. Commande Artisan (`php artisan hafrose:backup`)

La commande dédiée permet d'exécuter et de contrôler les sauvegardes depuis la ligne de commande ou via le planificateur CRON.

### Utilisation :

```bash
# Sauvegarde complète standard
php artisan hafrose:backup

# Simulation sans création d'archive
php artisan hafrose:backup --dry-run

# Affichage détaillé de chaque étape dans la console
php artisan hafrose:backup --detailed

# Forcer l'exécution même si BACKUP_ENABLED=false
php artisan hafrose:backup --force
```

### Exemple de sortie console :

```
  ╔════════════════════════════════════════════╗
  ║         HAFROSE — Backup Complet           ║
  ╚════════════════════════════════════════════╝

  Démarré le : 2026-07-21 18:30:00
  Environnement : production

  Étapes :
  ────────────────────────────────────────────
  ✓ Disk check       : OK       — Espace disponible : 54380 Mo
  ✓ Database         : OK       — Dump MySQL : hafrose (1240 Ko)
  ✓ Storage          : OK       — 145 fichier(s) sauvegardé(s)
  ✓ Images           : OK       — 38 image(s) sauvegardée(s)
  ✓ Critical files   : OK       — 5 fichier(s) critique(s) sauvegardé(s)
  ✓ Archive          : OK       — Archive : hafrose-backup_2026-07-21_18-30-00.zip
  ✓ Rotation         : OK       — Rotation : 2 ancien(s) backup(s) supprimé(s)
  ────────────────────────────────────────────

  Sauvegarde créée : storage/app/backups/hafrose-backup_2026-07-21_18-30-00.zip
  Durée : 4.2 seconde(s)

  ✓ Sauvegarde terminée avec succès.
```

---

## 7. APIs d'Administration

Toutes les routes d'administration des sauvegardes sont enregistrées dans `routes/api.php` sous le groupe administrateur (`auth:sanctum` + middleware `admin`).

| Méthode | Route | Description | Journalisation |
|---|---|---|---|
| `POST` | `/api/admin/system/backup` | Déclencher une sauvegarde manuelle (`dry_run`, `verbose`) | `AdminLog` & `ActivityLog` |
| `GET` | `/api/admin/system/backups` | Lister les sauvegardes disponibles avec métadonnées | Consultation directe |
| `DELETE` | `/api/admin/system/backups/{id}` | Supprimer une sauvegarde spécifique | `AdminLog` & `ActivityLog` |

### Exemples de requêtes & réponses :

#### 1. Lancer une sauvegarde (`POST /api/admin/system/backup`)

**Requête :**
```json
POST /api/admin/system/backup
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "dry_run": false,
  "verbose": true
}
```

**Réponse 200 OK :**
```json
{
  "success": true,
  "message": "Sauvegarde créée avec succès.",
  "errors": null,
  "data": {
    "success": true,
    "dry_run": false,
    "started_at": "2026-07-21T18:30:00.000000Z",
    "steps": [
      { "name": "disk_check", "status": "OK", "message": "Espace disponible : 54380 Mo" },
      { "name": "database", "status": "OK", "message": "Dump MySQL : hafrose" },
      { "name": "storage", "status": "OK", "message": "145 fichier(s) sauvegardé(s)" },
      { "name": "images", "status": "OK", "message": "38 image(s) sauvegardée(s)" },
      { "name": "critical_files", "status": "OK", "message": "5 fichier(s) critique(s) sauvegardé(s)" },
      { "name": "archive", "status": "OK", "message": "Archive : hafrose-backup_2026-07-21_18-30-00.zip" }
    ],
    "archive": "backups/hafrose-backup_2026-07-21_18-30-00.zip",
    "errors": [],
    "ended_at": "2026-07-21T18:30:04.000000Z",
    "duration_s": 4
  }
}
```

#### 2. Lister les sauvegardes (`GET /api/admin/system/backups`)

**Réponse 200 OK :**
```json
{
  "success": true,
  "message": null,
  "errors": null,
  "data": [
    {
      "id": "hafrose-backup_2026-07-21_18-30-00",
      "filename": "hafrose-backup_2026-07-21_18-30-00.zip",
      "path": "backups/hafrose-backup_2026-07-21_18-30-00.zip",
      "size_kb": 4520.5,
      "size_human": "4.41 Mo",
      "created_at": "2026-07-21T18:30:04+00:00"
    }
  ],
  "meta": {
    "total": 1,
    "backup_path": "backups",
    "disk": "local"
  }
}
```

#### 3. Supprimer une sauvegarde (`DELETE /api/admin/system/backups/{id}`)

**Réponse 200 OK :**
```json
{
  "success": true,
  "message": "Sauvegarde 'hafrose-backup_2026-07-21_18-30-00' supprimée avec succès.",
  "errors": null,
  "data": null
}
```

---

## 8. Procédure de Restauration

Pour restaurer une sauvegarde en production :

1. Repasser l'application en mode maintenance :
   ```bash
   php artisan down --secret="VOTRE_SECRET_DE_MAINTENANCE"
   ```
2. Télécharger l'archive ZIP depuis `storage/app/backups/`.
3. Décompresser l'archive dans un répertoire temporaire.
4. Restaurer la base de données :
   ```bash
   mysql -u root -p hafrose < database/database.sql
   ```
5. Restaurer le contenu de `storage/app` et `public/images/`.
6. Repasser l'application en ligne :
   ```bash
   php artisan up
   ```

---

## 9. Bonnes Pratiques de Production

1. **Stockage distant** : Pour la production, configurez `BACKUP_STORAGE_DISK=s3` dans `.env` afin de dupliquer automatiquement les archives sur un bucket S3 sécurisé ou un stockage hors site.
2. **Planification CRON** : Assurez-vous que le Scheduler Laravel s'exécute chaque minute via la crontab du serveur :
   ```cron
   * * * * * cd /chemin/vers/hafrose/backend && php artisan schedule:run >> /dev/null 2>&1
   ```
3. **Contrôle d'espace disque** : Conservez au moins `500 Mo` d'espace libre configuré via `BACKUP_MIN_DISK_SPACE_MB`.
