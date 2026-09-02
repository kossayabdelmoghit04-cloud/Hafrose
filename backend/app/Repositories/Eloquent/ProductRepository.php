<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Services\PerformanceCacheManager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Obtenir les produits filtrés et paginés.
     */
    public function paginateWithFilters(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $maxPerPage = config('cache-performance.pagination.max_per_page', 100);
        $perPage = min(max(1, $perPage), $maxPerPage);

        $query = Product::query();

        // Filtre par catégorie (ID ou Slug)
        if (! empty($filters['category'])) {
            $query->whereHas('category', function ($q) use ($filters) {
                $q->where('slug', $filters['category'])
                    ->orWhere('id', $filters['category']);
            });
        }

        // Filtre par prix minimum
        $minPrice = $filters['price_min'] ?? $filters['min_price'] ?? null;
        if (isset($minPrice) && $minPrice !== '') {
            $query->where('price', '>=', (float) $minPrice);
        }

        // Filtre par prix maximum
        $maxPrice = $filters['price_max'] ?? $filters['max_price'] ?? null;
        if (isset($maxPrice) && $maxPrice !== '') {
            $query->where('price', '<=', (float) $maxPrice);
        }

        // Filtre par couleur
        if (! empty($filters['color'])) {
            $query->where('color', $filters['color']);
        }

        // Filtre par matière
        if (! empty($filters['material'])) {
            $query->where('material', $filters['material']);
        }

        // Filtre par recherche textuelle
        $search = $filters['q'] ?? $filters['search'] ?? null;
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Filtre produits vedettes
        if (isset($filters['is_featured']) && ($filters['is_featured'] === true || $filters['is_featured'] === 'true' || $filters['is_featured'] === '1' || $filters['is_featured'] === 1)) {
            $query->where('is_featured', true);
        }

        // Filtre produits soldés
        if (isset($filters['on_sale']) && ($filters['on_sale'] === true || $filters['on_sale'] === 'true' || $filters['on_sale'] === '1' || $filters['on_sale'] === 1)) {
            $query->whereNotNull('sale_price')
                ->where('sale_price', '>', 0)
                ->whereColumn('sale_price', '<', 'price');
        }

        // Tri sécurisé — gestion des alias du frontend
        $allowedSorts = ['price', 'created_at', 'name'];
        $rawSort = $filters['sort'] ?? $filters['sort_by'] ?? 'created_at';

        // Mapper les alias du frontend vers les colonnes réelles
        $sortMap = [
            'featured' => ['column' => 'is_featured', 'direction' => 'desc'],
            'latest' => ['column' => 'created_at',  'direction' => 'desc'],
            'price_asc' => ['column' => 'price',       'direction' => 'asc'],
            'price_desc' => ['column' => 'price',       'direction' => 'desc'],
        ];

        if (isset($sortMap[$rawSort])) {
            $sortBy = $sortMap[$rawSort]['column'];
            $sortOrder = $sortMap[$rawSort]['direction'];
        } else {
            $sortBy = in_array($rawSort, $allowedSorts) ? $rawSort : 'created_at';
            $sortOrder = $filters['direction'] ?? $filters['sort_order'] ?? 'desc';
            $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';
        }

        // Cas spécial : tri "vedette" — les produits mis en avant d'abord, puis par date
        if ($sortBy === 'is_featured') {
            $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Eager load category et galleries pour éliminer N+1
        $query->with(['category', 'galleries']);

        return $query->paginate($perPage);
    }

    /**
     * Trouver un produit par son slug avec ses relations.
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
        return Product::with(['category', 'galleries'])->find($id);
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
        $product = Product::create($data);
        PerformanceCacheManager::invalidateProducts();

        return $product;
    }

    /**
     * Mettre à jour un produit.
     */
    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        PerformanceCacheManager::invalidateProducts();

        return $product;
    }

    /**
     * Supprimer un produit.
     */
    public function delete(Product $product): bool
    {
        $deleted = $product->delete();
        PerformanceCacheManager::invalidateProducts();

        return $deleted;
    }

    /**
     * Obtenir les données de filtres pour la boutique avec mise en cache.
     */
    public function getFiltersData(): array
    {
        $ttl = config('cache-performance.ttls.filters', 3600);

        return PerformanceCacheManager::remember('products_filters_data', $ttl, function () {
            $categories = Category::whereHas('products')
                ->withCount('products')
                ->get();

            $stats = Product::query()
                ->selectRaw('MIN(price) as min_price, MAX(price) as max_price, COUNT(*) as total_count, AVG(price) as avg_price, SUM(stock) as total_stock')
                ->first();

            $brands = Product::query()
                ->whereNotNull('brand')
                ->where('brand', '!=', '')
                ->distinct()
                ->orderBy('brand')
                ->pluck('brand')
                ->toArray();

            $featuredCount = Product::query()
                ->where('is_featured', true)
                ->count();

            $onSaleCount = Product::query()
                ->whereNotNull('sale_price')
                ->where('sale_price', '>', 0)
                ->whereColumn('sale_price', '<', 'price')
                ->count();

            return [
                'categories' => $categories,
                'price' => [
                    'min' => $stats ? (float) $stats->min_price : 0,
                    'max' => $stats ? (float) $stats->max_price : 0,
                ],
                'products_count' => $stats ? (int) $stats->total_count : 0,
                'brands' => $brands,
                'statistics' => [
                    'average_price' => $stats ? round((float) $stats->avg_price, 2) : 0,
                    'total_stock' => $stats ? (int) $stats->total_stock : 0,
                    'featured_count' => $featuredCount,
                    'on_sale_count' => $onSaleCount,
                ],
            ];
        }, ['filters', 'products']);
    }

    /**
     * Obtenir les produits similaires à un produit donné.
     */
    public function getRelatedProducts(Product $product, int $limit = 4): Collection
    {
        $related = Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'galleries'])
            ->orderByRaw('ABS(price - ?) ASC', [$product->price])
            ->limit($limit)
            ->get();

        if ($related->count() < $limit) {
            $remaining = $limit - $related->count();
            $excludeIds = $related->pluck('id')->push($product->id)->all();

            $fallback = Product::query()
                ->whereNotIn('id', $excludeIds)
                ->with(['category', 'galleries'])
                ->orderBy('created_at', 'desc')
                ->limit($remaining)
                ->get();

            $related = $related->merge($fallback);
        }

        return $related;
    }

    /**
     * Obtenir les produits les plus populaires avec mise en cache.
     */
    public function getPopularProducts(int $limit = 8): Collection
    {
        $ttl = config('cache-performance.ttls.popular_products', 3600);
        $key = "popular_products_list_{$limit}";

        $productIds = PerformanceCacheManager::remember($key, $ttl, function () use ($limit) {
            return Product::query()
                ->withCount('orderItems')
                ->orderBy('order_items_count', 'desc')
                ->orderBy('is_featured', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->pluck('id')
                ->toArray();
        }, ['popular', 'products']);

        if (empty($productIds)) {
            return new Collection;
        }

        // Conserver l'ordre exact des IDs du cache
        return Product::whereIn('id', $productIds)
            ->with(['category', 'galleries'])
            ->withCount('orderItems')
            ->get()
            ->sortBy(fn ($product) => array_search($product->id, $productIds))
            ->values();
    }

    /**
     * Obtenir les produits similaires de la même catégorie.
     */
    public function getSimilarProducts(Product $product, int $limit = 8): Collection
    {
        return Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'galleries'])
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }

    /**
     * Obtenir les produits populaires avec score pondéré.
     */
    public function getPopularProductsWithWeights(int $limit = 8, array $weights = []): Collection
    {
        $ttl = config('cache-performance.ttls.popular_products', 3600);
        $key = "popular_products_list_{$limit}";

        $productIds = PerformanceCacheManager::remember($key, $ttl, function () use ($limit, $weights) {
            $wOrders = $weights['orders'] ?? config('recommendations.popularity_weights.orders', 3.0);
            $wRating = $weights['rating'] ?? config('recommendations.popularity_weights.rating', 5.0);
            $wReviews = $weights['reviews'] ?? config('recommendations.popularity_weights.reviews', 2.0);

            return Product::query()
                ->withCount('orderItems')
                ->withCount(['reviews as approved_reviews_count' => function ($q) {
                    $q->where('is_approved', true);
                }])
                ->withAvg(['reviews as approved_reviews_avg_rating' => function ($q) {
                    $q->where('is_approved', true);
                }], 'rating')
                ->orderByRaw('((order_items_count * ?) + (COALESCE(approved_reviews_avg_rating, 0) * ?) + (approved_reviews_count * ?)) DESC', [$wOrders, $wRating, $wReviews])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->pluck('id')
                ->toArray();
        }, ['popular', 'products']);

        if (empty($productIds)) {
            return new Collection;
        }

        return Product::whereIn('id', $productIds)
            ->with(['category', 'galleries'])
            ->get()
            ->sortBy(fn ($product) => array_search($product->id, $productIds))
            ->values();
    }

    /**
     * Recherche avancée multicritère.
     */
    public function searchAdvanced(array $params, int $perPage = 12, array $weights = []): LengthAwarePaginator
    {
        $maxPerPage = config('cache-performance.pagination.max_per_page', 100);
        $perPage = min(max(1, $perPage), $maxPerPage);

        $query = Product::query()->with(['category', 'galleries']);

        if (! empty($params['q'])) {
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

        if (! empty($params['category'])) {
            $category = $params['category'];
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)
                    ->orWhere('id', $category);
            });
        }

        if (isset($params['price_min']) && $params['price_min'] !== '') {
            $query->where('price', '>=', (float) $params['price_min']);
        }

        if (isset($params['price_max']) && $params['price_max'] !== '') {
            $query->where('price', '<=', (float) $params['price_max']);
        }

        if (! empty($params['brand'])) {
            $query->where('brand', $params['brand']);
        }

        if (isset($params['on_sale']) && ($params['on_sale'] === true || $params['on_sale'] === 'true' || $params['on_sale'] === '1' || $params['on_sale'] === 1)) {
            $query->whereNotNull('sale_price')
                ->where('sale_price', '>', 0)
                ->whereColumn('sale_price', '<', 'price');
        }

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
            $wOrders = $weights['orders'] ?? config('recommendations.popularity_weights.orders', 3.0);
            $wRating = $weights['rating'] ?? config('recommendations.popularity_weights.rating', 5.0);
            $wReviews = $weights['reviews'] ?? config('recommendations.popularity_weights.reviews', 2.0);

            $query->withCount('orderItems')
                ->withCount(['reviews as approved_reviews_count' => function ($q) {
                    $q->where('is_approved', true);
                }])
                ->withAvg(['reviews as approved_reviews_avg_rating' => function ($q) {
                    $q->where('is_approved', true);
                }], 'rating')
                ->orderByRaw('((order_items_count * ?) + (COALESCE(approved_reviews_avg_rating, 0) * ?) + (approved_reviews_count * ?)) DESC', [$wOrders, $wRating, $wReviews])
                ->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }
}
