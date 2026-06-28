<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    /**
     * Obtenir toutes les catégories.
     */
    public function all(): Collection
    {
        return Category::all();
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
        return Category::create($data);
    }

    /**
     * Mettre à jour une catégorie.
     */
    public function update(Category $category, array $data): Category
    {
        $category->update($data);
        return $category;
    }

    /**
     * Supprimer une catégorie.
     */
    public function delete(Category $category): bool
    {
        return $category->delete();
    }
}
