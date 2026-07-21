<?php

return [

    /*
    |--------------------------------------------------------------------------
    | System Monitoring & Observability Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration complète pour la surveillance du serveur, des métriques,
    | du health check et des performances de l'application HAFROSE.
    | Toutes les options sont débrayables et paramétrables via .env.
    |
    */

    'enabled' => env('MONITORING_ENABLED', true),

    'health_enabled' => env('MONITORING_HEALTH_ENABLED', true),

    'metrics_enabled' => env('MONITORING_METRICS_ENABLED', true),

    'log_channel' => env('MONITORING_LOG_CHANNEL', 'daily'),

    // Seuils d'alerte de performance (en millisecondes)
    'slow_request_threshold' => (int) env('MONITORING_SLOW_REQUEST_THRESHOLD', 1000),

    'slow_query_threshold' => (int) env('MONITORING_SLOW_QUERY_THRESHOLD', 200),

    // Seuils d'avertissement et critiques (en pourcentage)
    'memory_warning' => (float) env('MONITORING_MEMORY_WARNING', 80.0),

    'disk_warning' => (float) env('MONITORING_DISK_WARNING', 80.0),

    'disk_critical' => (float) env('MONITORING_DISK_CRITICAL', 90.0),

    'cpu_warning' => (float) env('MONITORING_CPU_WARNING', 80.0),

    // Activation de la surveillance par composant
    'scheduler_monitoring' => env('MONITORING_SCHEDULER_ENABLED', true),

    'queue_monitoring' => env('MONITORING_QUEUE_ENABLED', true),

    'cache_monitoring' => env('MONITORING_CACHE_ENABLED', true),

];
