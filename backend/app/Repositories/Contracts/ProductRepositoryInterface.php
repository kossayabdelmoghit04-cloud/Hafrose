<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    /**
     * Obtenir les produits filtrés et paginés.
     */
    public function paginateWithFilters(array $filters, int $perPage = 12): LengthAwarePaginator;

    /**
     * Trouver un produit par son slug (avec relations).
     */
    public function findBySlug(string $slug): ?Product;

    /**
     * Trouver un produit par son ID.
     */
    public function find(int $id): ?Product;

    /**
     * Trouver un produit par son ID avec un verrou exclusif de mise à jour (Pessimistic Lock).
     */
    public function findForUpdate(int $id): ?Product;

    /**
     * Créer un produit.
     */
    public function create(array $data): Product;

    /**
     * Mettre à jour un produit.
     */
    public function update(Product $product, array $data): Product;

    /**
     * Supprimer un produit.
     */
    public function delete(Product $product): bool;
}
