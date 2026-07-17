<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Nombre de produits similaires retournés
    |--------------------------------------------------------------------------
    |
    | Nombre maximum de produits retournés par GET /api/products/{product}/related.
    | Si la catégorie contient moins de produits, le reste est complété avec
    | les produits les plus récents (hors produit courant).
    |
    */
    'related_limit' => env('RECOMMENDATIONS_RELATED_LIMIT', 4),

    /*
    |--------------------------------------------------------------------------
    | Nombre de produits populaires retournés
    |--------------------------------------------------------------------------
    |
    | Nombre maximum de produits retournés par GET /api/products/popular.
    |
    */
    'popular_limit' => env('RECOMMENDATIONS_POPULAR_LIMIT', 8),

];
