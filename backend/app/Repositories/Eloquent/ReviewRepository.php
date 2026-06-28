<?php

namespace App\Repositories\Eloquent;

use App\Models\Review;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ReviewRepository implements ReviewRepositoryInterface
{
    /**
     * Obtenir tous les avis approuvés ordonnés par date décroissante.
     */
    public function allApproved(int $limit = 20): Collection
    {
        return Review::where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Créer un nouvel avis.
     */
    public function create(array $data): Review
    {
        return Review::create($data);
    }

    /**
     * Obtenir tous les avis (avec pagination pour l'admin).
     */
    public function paginate(int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return Review::with('product')->latest()->paginate($perPage);
    }

    /**
     * Trouver un avis par son ID.
     */
    public function find(int $id): ?Review
    {
        return Review::with('product')->find($id);
    }

    /**
     * Mettre à jour un avis.
     */
    public function update(Review $review, array $data): Review
    {
        $review->update($data);
        return $review;
    }

    /**
     * Supprimer un avis.
     */
    public function delete(Review $review): bool
    {
        return $review->delete();
    }
}
