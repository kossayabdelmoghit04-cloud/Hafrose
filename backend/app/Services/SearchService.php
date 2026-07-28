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
}
