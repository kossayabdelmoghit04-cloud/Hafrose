<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Obtenir les produits filtrés et paginés.
     */
    public function paginateWithFilters(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $query = Product::query();

        // Filtre par catégorie (ID ou Slug)
        if (!empty($filters['category'])) {
            $query->whereHas('category', function ($q) use ($filters) {
                $q->where('slug', $filters['category'])
                  ->orWhere('id', $filters['category']);
            });
        }

        // Filtre par prix minimum (supporte price_min et min_price)
        $minPrice = $filters['price_min'] ?? $filters['min_price'] ?? null;
        if (isset($minPrice) && $minPrice !== '') {
            $query->where('price', '>=', (float) $minPrice);
        }

        // Filtre par prix maximum (supporte price_max et max_price)
        $maxPrice = $filters['price_max'] ?? $filters['max_price'] ?? null;
        if (isset($maxPrice) && $maxPrice !== '') {
            $query->where('price', '<=', (float) $maxPrice);
        }

        // Filtre par couleur
        if (!empty($filters['color'])) {
            $query->where('color', $filters['color']);
        }

        // Filtre par matière
        if (!empty($filters['material'])) {
            $query->where('material', $filters['material']);
        }

        // Filtre par recherche textuelle (supporte q et search)
        // Les vérifications Schema::hasColumn sont calculées une seule fois hors de la closure
        $search = $filters['q'] ?? $filters['search'] ?? null;
        if (!empty($search)) {
            $hasShortDescription = \Illuminate\Support\Facades\Schema::hasColumn('products', 'short_description');
            $hasSku              = \Illuminate\Support\Facades\Schema::hasColumn('products', 'sku');

            $query->where(function ($q) use ($search, $hasShortDescription, $hasSku) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");

                if ($hasShortDescription) {
                    $q->orWhere('short_description', 'like', "%{$search}%");
                }

                if ($hasSku) {
                    $q->orWhere('sku', 'like', "%{$search}%");
                }
            });
        }

        // Filtre produits vedettes
        if (isset($filters['is_featured']) && ($filters['is_featured'] === true || $filters['is_featured'] === 'true' || $filters['is_featured'] === '1' || $filters['is_featured'] === 1)) {
            $query->where('is_featured', true);
        }

        // Tri (sécurisé contre les injections SQL, supporte sort et sort_by)
        $allowedSorts = ['price', 'created_at', 'name'];
        $sortBy = $filters['sort'] ?? $filters['sort_by'] ?? 'created_at';
        $sortBy = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        
        $sortOrder = $filters['direction'] ?? $filters['sort_order'] ?? 'desc';
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortOrder);

        // Eager load category relation to avoid N+1 query issues
        $query->with('category');

        return $query->paginate($perPage);
    }

    /**
     * Trouver un produit par son slug avec ses relations (catégorie, galerie, avis approuvés).
     */
    public function findBySlug(string $slug): ?Product
    {
        return Product::where('slug', $slug)
            ->with(['category', 'galleries', 'reviews' => function ($q) {
                $q->where('is_approved', true);
            }])
            ->first();
    }

    /**
     * Trouver un produit par son ID.
     */
    public function find(int $id): ?Product
    {
        return Product::find($id);
    }

    /**
     * Trouver un produit par son ID avec verrou exclusif (Pessimistic Lock).
     */
    public function findForUpdate(int $id): ?Product
    {
        return Product::lockForUpdate()->find($id);
    }

    /**
     * Créer un produit.
     */
    public function create(array $data): Product
    {
        return Product::create($data);
    }

    /**
     * Mettre à jour un produit.
     */
    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    /**
     * Supprimer un produit.
     */
    public function delete(Product $product): bool
    {
        return $product->delete();
    }

    /**
     * Obtenir les données de filtres pour la boutique.
     */
    public function getFiltersData(): array
    {
        $hasActiveCheck = \Illuminate\Support\Facades\Schema::hasColumn('products', 'is_active');

        // Récupérer uniquement les catégories contenant au moins un produit actif (et compter ses produits)
        $categories = \App\Models\Category::whereHas('products', function ($query) use ($hasActiveCheck) {
            if ($hasActiveCheck) {
                $query->where('is_active', true);
            }
        })
        ->withCount(['products' => function ($query) use ($hasActiveCheck) {
            if ($hasActiveCheck) {
                $query->where('is_active', true);
            }
        }])
        ->get();

        // Calculer le prix min, max, count et les statistiques utiles en une seule requête SQL
        $stats = Product::query()
            ->when($hasActiveCheck, function ($query) {
                $query->where('is_active', true);
            })
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price, COUNT(*) as total_count, AVG(price) as avg_price, SUM(stock) as total_stock')
            ->first();

        // Récupérer les marques uniques disponibles parmi les produits actifs
        $brands = Product::query()
            ->when($hasActiveCheck, function ($query) {
                $query->where('is_active', true);
            })
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand')
            ->toArray();

        // Calculer le nombre de produits mis en avant (featured)
        $featuredCount = Product::query()
            ->when($hasActiveCheck, function ($query) {
                $query->where('is_active', true);
            })
            ->where('is_featured', true)
            ->count();

        return [
            'categories' => $categories,
            'price' => [
                'min' => $stats ? $stats->min_price : 0,
                'max' => $stats ? $stats->max_price : 0,
            ],
            'products_count' => $stats ? $stats->total_count : 0,
            'brands' => $brands,
            'statistics' => [
                'average_price' => $stats ? round((float) $stats->avg_price, 2) : 0,
                'total_stock'   => $stats ? (int) $stats->total_stock : 0,
                'featured_count' => $featuredCount,
            ]
        ];
    }

    /**
     * Obtenir les produits similaires à un produit donné (même catégorie, triés par proximité de prix).
     * Si la catégorie contient peu de résultats, complète avec les produits les plus récents.
     *
     * @param  \App\Models\Product  $product
     * @param  int                  $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRelatedProducts(Product $product, int $limit = 4): \Illuminate\Database\Eloquent\Collection
    {
        // --- 1. Produits de la même catégorie, triés par proximité de prix ---
        $related = Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with('category')
            ->orderByRaw('ABS(price - ?) ASC', [$product->price])
            ->limit($limit)
            ->get();

        // --- 2. Compléter si pas assez de résultats dans la catégorie ---
        if ($related->count() < $limit) {
            $remaining = $limit - $related->count();

            // IDs déjà récupérés (catégorie) + ID du produit courant
            $excludeIds = $related->pluck('id')
                ->push($product->id)
                ->all();

            $fallback = Product::query()
                ->whereNotIn('id', $excludeIds)
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->limit($remaining)
                ->get();

            $related = $related->merge($fallback);
        }

        return $related;
    }

    /**
     * Obtenir les produits les plus populaires.
     *
     * Stratégie choisie : nombre de fois commandés (count des order_items).
     * C'est le signal le plus fiable de l'attractivité réelle d'un produit.
     * En cas d'égalité : produits vedettes en premier (is_featured), puis les plus récents.
     *
     * La requête utilise un sous-select pour calculer orders_count sans JOIN qui duplique les lignes,
     * et sans withCount() pour rester lisible et extensible.
     *
     * Pour remplacer la logique : modifier uniquement cette méthode dans le Repository.
     *
     * @param  int  $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPopularProducts(int $limit = 8): \Illuminate\Database\Eloquent\Collection
    {
        return Product::query()
            ->with('category')
            ->withCount('orderItems')                      // eager: évite N+1
            ->orderBy('order_items_count', 'desc')        // 1er critère : le + commandé
            ->orderBy('is_featured', 'desc')              // 2e critère : vedette
            ->orderBy('created_at', 'desc')               // 3e critère : le + récent
            ->limit($limit)
            ->get();
    }

    /**
     * Obtenir les produits similaires de la même catégorie, triés aléatoirement.
     */
    public function getSimilarProducts(Product $product, int $limit = 8): \Illuminate\Database\Eloquent\Collection
    {
        $hasActiveCheck = \Illuminate\Support\Facades\Schema::hasColumn('products', 'is_active');

        return Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->when($hasActiveCheck, function ($q) {
                $q->where('is_active', true);
            })
            ->with('category')
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }

    /**
     * Obtenir les produits les plus populaires selon un calcul de score pondéré.
     */
    public function getPopularProductsWithWeights(int $limit = 8, array $weights = []): \Illuminate\Database\Eloquent\Collection
    {
        $hasActiveCheck = \Illuminate\Support\Facades\Schema::hasColumn('products', 'is_active');

        $wOrders  = $weights['orders']  ?? config('recommendations.popularity_weights.orders', 3.0);
        $wRating  = $weights['rating']  ?? config('recommendations.popularity_weights.rating', 5.0);
        $wReviews = $weights['reviews'] ?? config('recommendations.popularity_weights.reviews', 2.0);

        return Product::query()
            ->when($hasActiveCheck, function ($query) {
                $query->where('is_active', true);
            })
            ->with('category')
            ->withCount('orderItems')
            ->withCount(['reviews as approved_reviews_count' => function ($q) {
                $q->where('is_approved', true);
            }])
            ->withAvg(['reviews as approved_reviews_avg_rating' => function ($q) {
                $q->where('is_approved', true);
            }], 'rating')
            ->orderByRaw("((order_items_count * ?) + (COALESCE(approved_reviews_avg_rating, 0) * ?) + (approved_reviews_count * ?)) DESC", [$wOrders, $wRating, $wReviews])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Effectuer une recherche avancée multicritère avec tris personnalisés.
     */
    public function searchAdvanced(array $params, int $perPage = 12, array $weights = []): LengthAwarePaginator
    {
        $query = Product::query()->with('category');
        $hasActiveCheck = \Illuminate\Support\Facades\Schema::hasColumn('products', 'is_active');

        // Toujours filtrer sur les produits actifs en production
        $query->when($hasActiveCheck, function ($q) {
            $q->where('is_active', true);
        });

        // Recherche textuelle q
        if (!empty($params['q'])) {
            $search = $params['q'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($catQ) use ($search) {
                      $catQ->where('name', 'like', "%{$search}%")
                           ->orWhere('slug', 'like', "%{$search}%");
                  });
            });
        }

        // Filtre par catégorie
        if (!empty($params['category'])) {
            $category = $params['category'];
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)
                  ->orWhere('id', $category);
            });
        }

        // Filtre par prix min
        if (isset($params['price_min']) && $params['price_min'] !== '') {
            $query->where('price', '>=', (float) $params['price_min']);
        }

        // Filtre par prix max
        if (isset($params['price_max']) && $params['price_max'] !== '') {
            $query->where('price', '<=', (float) $params['price_max']);
        }

        // Filtre par marque
        if (!empty($params['brand'])) {
            $query->where('brand', $params['brand']);
        }

        // Tri
        $sort = $params['sort'] ?? 'newest';

        if ($sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } elseif ($sort === 'newest') {
            $query->orderBy('created_at', 'desc');
        } elseif ($sort === 'rating') {
            $query->withAvg(['reviews as approved_reviews_avg_rating' => function ($q) {
                $q->where('is_approved', true);
            }], 'rating')
            ->orderByRaw('COALESCE(approved_reviews_avg_rating, 0) DESC')
            ->orderBy('created_at', 'desc');
        } elseif ($sort === 'popular') {
            $wOrders  = $weights['orders']  ?? config('recommendations.popularity_weights.orders', 3.0);
            $wRating  = $weights['rating']  ?? config('recommendations.popularity_weights.rating', 5.0);
            $wReviews = $weights['reviews'] ?? config('recommendations.popularity_weights.reviews', 2.0);

            $query->withCount('orderItems')
                ->withCount(['reviews as approved_reviews_count' => function ($q) {
                    $q->where('is_approved', true);
                }])
                ->withAvg(['reviews as approved_reviews_avg_rating' => function ($q) {
                    $q->where('is_approved', true);
                }], 'rating')
                ->orderByRaw("((order_items_count * ?) + (COALESCE(approved_reviews_avg_rating, 0) * ?) + (approved_reviews_count * ?)) DESC", [$wOrders, $wRating, $wReviews])
                ->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }
}
