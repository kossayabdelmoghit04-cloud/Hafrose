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

    /*
    |--------------------------------------------------------------------------
    | Coefficients de calcul du score de popularité
    |--------------------------------------------------------------------------
    |
    | Utilisés pour trier les produits populaires dans GET /api/products/popular.
    |
    */
    'popularity_weights' => [
        'orders'  => (float) env('RECOMMENDATIONS_POPULARITY_WEIGHT_ORDERS', 3.0),
        'rating'  => (float) env('RECOMMENDATIONS_POPULARITY_WEIGHT_RATING', 5.0),
        'reviews' => (float) env('RECOMMENDATIONS_POPULARITY_WEIGHT_REVIEWS', 2.0),
    ],

];
