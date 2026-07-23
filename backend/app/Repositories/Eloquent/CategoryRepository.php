<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Services\PerformanceCacheManager;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    /**
     * Obtenir toutes les catégories avec mise en cache.
     */
    public function all(): Collection
    {
        $ttl = config('cache-performance.ttls.categories', 86400);

        return PerformanceCacheManager::remember('categories_all', $ttl, function () {
            return Category::all();
        }, ['categories']);
    }

    /**
     * Trouver une catégorie par son slug.
     */
    public function findBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)->first();
    }

    /**
     * Trouver une catégorie par son identifiant.
     */
    public function find(int $id): ?Category
    {
        return Category::find($id);
    }

    /**
     * Créer une catégorie.
     */
    public function create(array $data): Category
    {
        $category = Category::create($data);
        PerformanceCacheManager::invalidateCategories();

        return $category;
    }

    /**
     * Mettre à jour une catégorie.
     */
    public function update(Category $category, array $data): Category
    {
        $category->update($data);
        PerformanceCacheManager::invalidateCategories();

        return $category;
    }

    /**
     * Supprimer une catégorie.
     */
    public function delete(Category $category): bool
    {
        $deleted = $category->delete();
        PerformanceCacheManager::invalidateCategories();

        return $deleted;
    }
}
