<?php

namespace App\Repositories\Contracts;

use App\Models\Review;
use Illuminate\Database\Eloquent\Collection;

interface ReviewRepositoryInterface
{
    /**
     * Obtenir tous les avis approuvés.
     */
    public function allApproved(int $limit = 20): Collection;

    /**
     * Créer un nouvel avis.
     */
    public function create(array $data): Review;

    /**
     * Obtenir tous les avis (avec pagination pour l'admin).
     */
    public function paginate(int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator;

    /**
     * Trouver un avis par son ID.
     */
    public function find(int $id): ?Review;

    /**
     * Mettre à jour un avis (ex: approbation).
     */
    public function update(Review $review, array $data): Review;

    /**
     * Supprimer un avis.
     */
    public function delete(Review $review): bool;
}
