<?php

namespace App\Services;

use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class AiRecommendationService
{
    /**
     * Obtenir des recommandations personnalisées pour l'utilisateur ("Recommandé pour vous").
     */
    public function getForYouRecommendations(?int $userId = null, int $limit = 8): Collection
    {
        if ($userId) {
            $categoryIds = WishlistItem::where('user_id', $userId)
                ->join('products', 'wishlist_items.product_id', '=', 'products.id')
                ->pluck('products.category_id')
                ->unique();

            if ($categoryIds->isNotEmpty()) {
                return Product::whereIn('category_id', $categoryIds)
                    ->inRandomOrder()
                    ->take($limit)
                    ->get();
            }
        }

        // Fallback pour visiteurs anonymes ou nouvel utilisateur: produits vedettes et récents
        return Product::where('is_featured', true)
            ->take($limit)
            ->get();
    }

    /**
     * Produits complémentaires (fréquemment achetés ensemble avec le produit cible).
     */
    public function getComplementaryProducts(Product $product, int $limit = 4): Collection
    {
        return Product::where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', '!=', $product->category_id)
                      ->orWhereBetween('price', [$product->price * 0.2, $product->price * 1.5]);
            })
            ->inRandomOrder()
            ->take($limit)
            ->get();
    }

    /**
     * Recommandations basées sur les favoris / coup de cœur.
     */
    public function getFavoritesBasedRecommendations(?int $userId = null, int $limit = 6): Collection
    {
        if ($userId) {
            $favProductIds = WishlistItem::where('user_id', $userId)->pluck('product_id');

            if ($favProductIds->isNotEmpty()) {
                $favCategories = Product::whereIn('id', $favProductIds)->pluck('category_id')->unique();

                return Product::whereIn('category_id', $favCategories)
                    ->whereNotIn('id', $favProductIds)
                    ->take($limit)
                    ->get();
            }
        }

        return Product::orderBy('created_at', 'desc')
            ->take($limit)
            ->get();
    }
}
