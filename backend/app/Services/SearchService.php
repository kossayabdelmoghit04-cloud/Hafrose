<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class SearchService
{
    /**
     * Dictionnaire de synonymes e-commerce de luxe.
     */
    protected array $synonyms = [
        'robe' => ['tenue', 'caftan', 'abaya', 'dress'],
        'parfum' => ['fragrance', 'essence', 'eau de parfum', 'scent'],
        'sac' => ['pochette', 'handbag', 'cabas'],
        'soie' => ['silk', 'satin'],
        'or' => ['gold', 'rose gold'],
    ];

    /**
     * Autocomplétion intelligente de recherche.
     */
    public function autocomplete(string $query, int $limit = 5): array
    {
        $query = trim(strtolower($query));
        if (strlen($query) < 2) {
            return [];
        }

        $products = Product::where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('material', 'LIKE', "%{$query}%");
            })
            ->select('id', 'name', 'slug', 'price', 'image')
            ->take($limit)
            ->get();

        return $products->toArray();
    }

    /**
     * Recherche sémantique avec synonymes et tolérance d'orthographe.
     */
    public function semanticSearch(string $rawQuery, int $limit = 12): array
    {
        $normalized = trim(strtolower($rawQuery));
        $terms = explode(' ', $normalized);

        // Expansion sémantique avec dictionnaire de synonymes
        $expandedTerms = $terms;
        foreach ($terms as $term) {
            if (isset($this->synonyms[$term])) {
                $expandedTerms = array_merge($expandedTerms, $this->synonyms[$term]);
            }
        }
        $expandedTerms = array_unique($expandedTerms);

        $queryBuilder = Product::where(function ($q) use ($expandedTerms) {
                foreach ($expandedTerms as $t) {
                    if (strlen($t) >= 2) {
                        $q->orWhere('name', 'LIKE', "%{$t}%")
                          ->orWhere('description', 'LIKE', "%{$t}%")
                          ->orWhere('material', 'LIKE', "%{$t}%");
                    }
                }
            });

        $products = $queryBuilder->take($limit)->get();

        return [
            'query' => $rawQuery,
            'expanded_terms' => array_values($expandedTerms),
            'results_count' => $products->count(),
            'products' => $products,
        ];
    }
}
