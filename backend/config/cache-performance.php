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
        /*
        |----------------------------------------------------------------------
        | Qualité globale de compression (0-100)
        | 82 = excellent équilibre qualité visuelle / poids réduit
        |----------------------------------------------------------------------
        */
        'quality' => 82,

        /*
        |----------------------------------------------------------------------
        | Tailles des variantes — adaptées aux usages réels de l'interface
        |
        | card   → ProductCard / CategoryCard (grilles, ratio 3:4)
        | thumb  → Miniatures galerie produit (80px affichés)
        | large  → Vue détail plein format / galerie plein écran
        | banner → Bannières éditoriales / hero (format paysage)
        |----------------------------------------------------------------------
        */
        'sizes' => [
            'card'      => ['width' => 480,  'height' => 640,  'crop' => false],
            'thumb'     => ['width' => 120,  'height' => 160,  'crop' => true],
            'thumbnail' => ['width' => 120,  'height' => 160,  'crop' => true],
            'medium'    => ['width' => 480,  'height' => 640,  'crop' => false],
            'large'     => ['width' => 1200, 'height' => 1200, 'crop' => false],
            'banner'    => ['width' => 1400, 'height' => 700,  'crop' => false],
        ],

        /*
        |----------------------------------------------------------------------
        | Génération WebP
        | Si activé, une version .webp est générée pour chaque variante.
        | Compatible avec <picture> côté frontend.
        |----------------------------------------------------------------------
        */
        'generate_webp' => env('IMAGE_GENERATE_WEBP', true),
        'webp_quality'  => 80,
    ],

    'monitoring' => [
        'enabled' => (bool) env('PERFORMANCE_MONITORING_ENABLED', false),
    ],

];
