<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Environnement Général & Application
    |--------------------------------------------------------------------------
    */
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Configuration des Files d'Attente (Queues)
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'connection' => env('QUEUE_CONNECTION', 'database'),
        'default_queue' => env('SQS_QUEUE', 'default'),
        'timeout' => (int) env('QUEUE_TIMEOUT', 90),
        'max_tries' => (int) env('QUEUE_MAX_TRIES', 3),
        'worker_processes' => (int) env('QUEUE_WORKERS', 2),
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration du Planificateur de Tâches (Scheduler)
    |--------------------------------------------------------------------------
    */
    'scheduler' => [
        'enabled' => (bool) env('SCHEDULER_ENABLED', true),
        'run_interval' => env('SCHEDULER_INTERVAL', 'everyMinute'),
        'timezone' => env('APP_TIMEZONE', 'UTC'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration OPcache PHP
    |--------------------------------------------------------------------------
    */
    'opcache' => [
        'enabled' => (bool) env('OPCACHE_ENABLED', true),
        'validate_timestamps' => (bool) env('OPCACHE_VALIDATE_TIMESTAMPS', false),
        'revalidate_freq' => (int) env('OPCACHE_REVALIDATE_FREQ', 0),
        'max_accelerated_files' => (int) env('OPCACHE_MAX_ACCELERATED_FILES', 10000),
        'memory_consumption' => (int) env('OPCACHE_MEMORY_CONSUMPTION', 128),
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration du Cache Déploiement
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'default_store' => env('CACHE_STORE', 'file'),
        'prefix' => env('CACHE_PREFIX', 'hafrose_cache'),
        'default_ttl' => (int) env('CACHE_TTL', 3600),
    ],

    /*
    |--------------------------------------------------------------------------
    | Paramètres d'Exécution PHP
    |--------------------------------------------------------------------------
    */
    'php' => [
        'min_version' => '8.3.0',
        'memory_limit' => env('PHP_MEMORY_LIMIT', '512M'),
        'max_execution_time' => (int) env('PHP_MAX_EXECUTION_TIME', 60),
        'display_errors' => (bool) env('PHP_DISPLAY_ERRORS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Paramètres Nginx
    |--------------------------------------------------------------------------
    */
    'nginx' => [
        'worker_processes' => env('NGINX_WORKER_PROCESSES', 'auto'),
        'client_max_body_size' => env('NGINX_CLIENT_MAX_BODY_SIZE', '20M'),
        'keepalive_timeout' => (int) env('NGINX_KEEPALIVE_TIMEOUT', 65),
    ],

    /*
    |--------------------------------------------------------------------------
    | Paramètres Sécurité SSL / HTTPS
    |--------------------------------------------------------------------------
    */
    'ssl' => [
        'enabled' => (bool) env('SSL_ENABLED', true),
        'hsts_enabled' => (bool) env('SSL_HSTS_ENABLED', true),
        'secure_cookies' => (bool) env('SSL_SECURE_COOKIES', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Paramètres Supervisor
    |--------------------------------------------------------------------------
    */
    'supervisor' => [
        'enabled' => (bool) env('SUPERVISOR_ENABLED', true),
        'process_name' => env('SUPERVISOR_PROCESS_NAME', 'hafrose-worker'),
        'numprocs' => (int) env('SUPERVISOR_NUMPROCS', 2),
    ],

    /*
    |--------------------------------------------------------------------------
    | Flags de Déploiement
    |--------------------------------------------------------------------------
    */
    'flags' => [
        'maintenance_mode' => (bool) env('DEPLOY_MAINTENANCE_MODE', false),
        'auto_optimize' => (bool) env('DEPLOY_AUTO_OPTIMIZE', true),
        'health_check_enabled' => (bool) env('DEPLOY_HEALTH_CHECK_ENABLED', true),
    ],
];
