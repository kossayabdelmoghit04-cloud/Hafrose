<?php

namespace App\Repositories\Eloquent;

use App\Models\Review;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Services\PerformanceCacheManager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ReviewRepository implements ReviewRepositoryInterface
{
    /**
     * Obtenir tous les avis approuvés ordonnés par date décroissante.
     */
    public function allApproved(int $limit = 20): Collection
    {
        $ttl = config('cache-performance.ttls.statistics', 1800);
        $key = "reviews_approved_list_{$limit}";

        return PerformanceCacheManager::remember($key, $ttl, function () use ($limit) {
            return Review::where('is_approved', true)
                ->select('id', 'product_id', 'customer_name', 'rating', 'comment', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();
        }, ['reviews']);
    }

    /**
     * Créer un nouvel avis.
     */
    public function create(array $data): Review
    {
        $review = Review::create($data);
        PerformanceCacheManager::invalidateReviews();

        return $review;
    }

    /**
     * Obtenir tous les avis (avec pagination pour l'admin).
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        $maxPerPage = config('cache-performance.pagination.max_per_page', 100);
        $perPage = min(max(1, $perPage), $maxPerPage);

        return Review::with(['product' => function ($q) {
            $q->select('id', 'name', 'slug');
        }])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Trouver un avis par son ID.
     */
    public function find(int $id): ?Review
    {
        return Review::with(['product' => function ($q) {
            $q->select('id', 'name', 'slug');
        }])->find($id);
    }

    /**
     * Mettre à jour un avis.
     */
    public function update(Review $review, array $data): Review
    {
        $review->update($data);
        PerformanceCacheManager::invalidateReviews();

        return $review;
    }

    /**
     * Supprimer un avis.
     */
    public function delete(Review $review): bool
    {
        $deleted = $review->delete();
        PerformanceCacheManager::invalidateReviews();

        return $deleted;
    }
}
