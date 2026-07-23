<?php

return [

    /*
    |--------------------------------------------------------------------------
    | HAFROSE — Configuration de Production
    |--------------------------------------------------------------------------
    |
    | Ce fichier centralise tous les paramètres de production : sauvegardes,
    | maintenance, stockage, rétention, compression, santé et planificateur.
    | Toutes les valeurs sont pilotées par les variables d'environnement.
    |
    */

    // ─── Sauvegardes ────────────────────────────────────────────────────────────

    'backup' => [

        /**
         * Activer ou désactiver le système de sauvegarde automatique.
         */
        'enabled' => (bool) env('BACKUP_ENABLED', true),

        /**
         * Répertoire de destination des sauvegardes (relatif à storage/).
         */
        'path' => env('BACKUP_PATH', 'backups'),

        /**
         * Sauvegarder la base de données MySQL.
         */
        'database' => (bool) env('BACKUP_DATABASE', true),

        /**
         * Sauvegarder le répertoire storage/app.
         */
        'storage' => (bool) env('BACKUP_STORAGE', true),

        /**
         * Sauvegarder les images publiques (public/images).
         */
        'images' => (bool) env('BACKUP_IMAGES', true),

        /**
         * Compresser l'archive en ZIP.
         */
        'compress' => (bool) env('BACKUP_COMPRESS', true),

        /**
         * Préfixe du nom de fichier de sauvegarde.
         */
        'filename_prefix' => env('BACKUP_FILENAME_PREFIX', 'hafrose-backup'),

        /**
         * Espace disque minimal requis avant de lancer une sauvegarde (en Mo).
         */
        'min_disk_space_mb' => (int) env('BACKUP_MIN_DISK_SPACE_MB', 500),

        /**
         * Notifier par e-mail en cas d'échec de la sauvegarde.
         */
        'notify_on_failure' => (bool) env('BACKUP_NOTIFY_ON_FAILURE', false),

        /**
         * Adresse e-mail de notification en cas d'échec.
         */
        'notify_email' => env('BACKUP_NOTIFY_EMAIL', null),
    ],

    // ─── Rétention ──────────────────────────────────────────────────────────────

    'retention' => [

        /**
         * Nombre de sauvegardes journalières à conserver.
         */
        'daily' => (int) env('BACKUP_RETENTION_DAILY', 7),

        /**
         * Nombre de sauvegardes hebdomadaires à conserver.
         */
        'weekly' => (int) env('BACKUP_RETENTION_WEEKLY', 4),

        /**
         * Nombre de sauvegardes mensuelles à conserver.
         */
        'monthly' => (int) env('BACKUP_RETENTION_MONTHLY', 6),

        /**
         * Nombre de jours de rétention globale (tous types confondus).
         * Utilisé si la rotation par type n'est pas applicable.
         */
        'days' => (int) env('BACKUP_RETENTION_DAYS', 30),
    ],

    // ─── Compression ────────────────────────────────────────────────────────────

    'compression' => [

        /**
         * Niveau de compression ZIP (0 = aucun, 9 = maximal).
         */
        'level' => (int) env('BACKUP_COMPRESSION_LEVEL', 6),

        /**
         * Format d'archivage ('zip').
         */
        'format' => env('BACKUP_COMPRESSION_FORMAT', 'zip'),
    ],

    // ─── Maintenance ────────────────────────────────────────────────────────────

    'maintenance' => [

        /**
         * Secret Laravel pour bypasser la maintenance (query param ?secret=xxx).
         */
        'secret' => env('MAINTENANCE_SECRET', null),

        /**
         * Adresses IP autorisées pendant la maintenance (séparées par virgule).
         */
        'allowed_ips' => array_filter(
            explode(',', env('MAINTENANCE_ALLOWED_IPS', '')),
            fn (string $ip) => ! empty(trim($ip))
        ),

        /**
         * Message affiché lors de la maintenance.
         */
        'message' => env('MAINTENANCE_MESSAGE', 'Le service est temporairement en maintenance. Veuillez réessayer plus tard.'),

        /**
         * Durée estimée de la maintenance en secondes (0 = inconnue).
         */
        'retry_after' => (int) env('MAINTENANCE_RETRY_AFTER', 0),
    ],

    // ─── Stockage ───────────────────────────────────────────────────────────────

    'storage' => [

        /**
         * Disque utilisé pour les sauvegardes (local, s3…).
         */
        'disk' => env('BACKUP_STORAGE_DISK', 'local'),

        /**
         * Mode lecture seule du stockage en production.
         */
        'read_only' => (bool) env('PRODUCTION_READ_ONLY', false),

        /**
         * Chemins critiques à inclure dans les sauvegardes.
         */
        'critical_paths' => [
            'app/',
            'app/public/',
        ],
    ],

    // ─── Santé système ──────────────────────────────────────────────────────────

    'health' => [

        /**
         * Activer les vérifications de santé du système.
         */
        'enabled' => (bool) env('HEALTH_CHECK_ENABLED', true),

        /**
         * Seuil d'alerte pour l'espace disque utilisé (en pourcentage).
         */
        'disk_warning_threshold' => (int) env('HEALTH_DISK_WARNING_THRESHOLD', 85),

        /**
         * Seuil critique pour l'espace disque utilisé (en pourcentage).
         */
        'disk_critical_threshold' => (int) env('HEALTH_DISK_CRITICAL_THRESHOLD', 95),
    ],

    // ─── Planificateur ──────────────────────────────────────────────────────────

    'scheduler' => [

        /**
         * Activer les tâches planifiées automatiques.
         */
        'enabled' => (bool) env('SCHEDULER_ENABLED', true),

        /**
         * Heure de lancement de la sauvegarde quotidienne (format H:i).
         */
        'backup_time' => env('SCHEDULER_BACKUP_TIME', '02:00'),

        /**
         * Fuseau horaire du planificateur.
         */
        'timezone' => env('SCHEDULER_TIMEZONE', env('APP_TIMEZONE', 'UTC')),
    ],

];
