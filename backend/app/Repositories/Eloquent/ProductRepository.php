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

        // Filtre par prix minimum
        if (isset($filters['min_price']) && $filters['min_price'] !== '') {
            $query->where('price', '>=', (float) $filters['min_price']);
        }

        // Filtre par prix maximum
        if (isset($filters['max_price']) && $filters['max_price'] !== '') {
            $query->where('price', '<=', (float) $filters['max_price']);
        }

        // Filtre par couleur
        if (!empty($filters['color'])) {
            $query->where('color', $filters['color']);
        }

        // Filtre par matière
        if (!empty($filters['material'])) {
            $query->where('material', $filters['material']);
        }

        // Filtre par recherche textuelle (Nom, Description, Description courte)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
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

        // Tri (sécurisé contre les injections SQL)
        $allowedSorts = ['price', 'created_at', 'name'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSorts) ? $filters['sort_by'] : 'created_at';
        $sortOrder = strtolower($filters['sort_order'] ?? '') === 'asc' ? 'asc' : 'desc';

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
}
