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
        // Recherche dans name, description, et dynamiquement dans short_description et sku si existants
        $search = $filters['q'] ?? $filters['search'] ?? null;
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
                
                if (\Illuminate\Support\Facades\Schema::hasColumn('products', 'short_description')) {
                    $q->orWhere('short_description', 'like', "%{$search}%");
                }
                
                if (\Illuminate\Support\Facades\Schema::hasColumn('products', 'sku')) {
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

        // Calculer le prix min, max et le nombre total de produits en une seule requête SQL
        $stats = Product::query()
            ->when($hasActiveCheck, function ($query) {
                $query->where('is_active', true);
            })
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price, COUNT(*) as total_count')
            ->first();

        return [
            'categories' => $categories,
            'price' => [
                'min' => $stats ? $stats->min_price : 0,
                'max' => $stats ? $stats->max_price : 0,
            ],
            'products_count' => $stats ? $stats->total_count : 0,
        ];
    }

    /**
     * Obtenir les produits similaires à un produit donné.
     *
     * Algorithme :
     *  1. Cherche les produits de la même catégorie, en excluant le produit courant.
     *  2. Les trie par proximité de prix (ABS(price - current_price) ASC).
     *  3. Si le nombre de résultats est insuffisant, complète avec les produits les plus récents
     *     (toutes catégories), toujours en excluant le produit courant et sans doublons.
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
}
