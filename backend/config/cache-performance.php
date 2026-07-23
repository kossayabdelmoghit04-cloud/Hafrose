<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Performance & Cache Optimization System - HAFROSE
    |--------------------------------------------------------------------------
    |
    | Configuration globale du cache et de l'optimisation des performances.
    | Tous les TTL sont exprimés en secondes.
    |
    */

    'enabled' => env('CACHE_PERFORMANCE_ENABLED', true),

    'ttls' => [
        'products' => (int) env('CACHE_TTL_PRODUCTS', 3600),          // 1 heure
        'categories' => (int) env('CACHE_TTL_CATEGORIES', 86400),       // 24 heures
        'dashboard' => (int) env('CACHE_TTL_DASHBOARD', 1800),         // 30 minutes
        'statistics' => (int) env('CACHE_TTL_STATISTICS', 1800),        // 30 minutes
        'search' => (int) env('CACHE_TTL_SEARCH', 600),             // 10 minutes
        'filters' => (int) env('CACHE_TTL_FILTERS', 3600),            // 1 heure
        'popular_products' => (int) env('CACHE_TTL_POPULAR', 3600),            // 1 heure
        'similar_products' => (int) env('CACHE_TTL_SIMILAR', 3600),            // 1 heure
        'public_config' => (int) env('CACHE_TTL_PUBLIC_CONFIG', 86400),    // 24 heures
    ],

    'pagination' => [
        'max_per_page' => (int) env('PAGINATION_MAX_PER_PAGE', 100),
        'default_per_page' => (int) env('PAGINATION_DEFAULT_PER_PAGE', 12),
    ],

    'images' => [
        'quality' => 85,
        'sizes' => [
            'thumbnail' => ['width' => 150, 'height' => 150, 'crop' => true],
            'medium' => ['width' => 600, 'height' => 600, 'crop' => false],
            'large' => ['width' => 1200, 'height' => 1200, 'crop' => false],
        ],
    ],

    'monitoring' => [
        'enabled' => (bool) env('PERFORMANCE_MONITORING_ENABLED', false),
    ],

];
