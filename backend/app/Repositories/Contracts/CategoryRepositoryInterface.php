<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    /**
     * Obtenir toutes les catégories.
     */
    public function all(): Collection;

    /**
     * Trouver une catégorie par son slug.
     */
    public function findBySlug(string $slug): ?Category;

    /**
     * Trouver une catégorie par son identifiant.
     */
    public function find(int $id): ?Category;

    /**
     * Créer une catégorie.
     */
    public function create(array $data): Category;

    /**
     * Mettre à jour une catégorie.
     */
    public function update(Category $category, array $data): Category;

    /**
     * Supprimer une catégorie.
     */
    public function delete(Category $category): bool;
}
