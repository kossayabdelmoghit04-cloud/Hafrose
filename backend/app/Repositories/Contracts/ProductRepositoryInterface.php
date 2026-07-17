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

    /**
     * Obtenir les données de filtres pour la boutique (catégories, min/max prix, count).
     *
     * @return array
     */
    public function getFiltersData(): array;

    /**
     * Obtenir les produits similaires à un produit donné (même catégorie, triés par proximité de prix).
     * Si la catégorie contient peu de résultats, complète avec les produits les plus récents.
     *
     * @param  \App\Models\Product  $product
     * @param  int                  $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRelatedProducts(\App\Models\Product $product, int $limit = 4): \Illuminate\Database\Eloquent\Collection;

    /**
     * Obtenir les produits les plus populaires (triés par nombre de commandes, puis is_featured, puis date).
     *
     * @param  int  $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPopularProducts(int $limit = 8): \Illuminate\Database\Eloquent\Collection;
}
