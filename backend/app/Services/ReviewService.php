<?php

namespace App\Services;

use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Models\Review;
use Illuminate\Database\Eloquent\Collection;

class ReviewService
{
    protected ReviewRepositoryInterface $reviewRepository;

    public function __construct(ReviewRepositoryInterface $reviewRepository)
    {
        $this->reviewRepository = $reviewRepository;
    }

    /**
     * Récupérer la liste des avis approuvés.
     */
    public function getApprovedReviews(int $limit = 20): Collection
    {
        return $this->reviewRepository->allApproved($limit);
    }

    /**
     * Enregistrer un nouvel avis (non approuvé par défaut).
     */
    public function createReview(array $data): Review
    {
        $data['is_approved'] = false;
        return $this->reviewRepository->create($data);
    }

    /**
     * Récupérer les avis paginés pour l'administration.
     */
    public function getPaginatedReviews(int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->reviewRepository->paginate($perPage);
    }

    /**
     * Récupérer un avis par son ID.
     */
    public function getReviewById(int $id): Review
    {
        $review = $this->reviewRepository->find($id);

        if (!$review) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Review not found");
        }

        return $review;
    }

    /**
     * Approuver un avis client.
     */
    public function approveReview(Review $review): Review
    {
        return $this->reviewRepository->update($review, ['is_approved' => true]);
    }

    /**
     * Désapprouver / Rejeter un avis client.
     */
    public function rejectReview(Review $review): Review
    {
        return $this->reviewRepository->update($review, ['is_approved' => false]);
    }

    /**
     * Supprimer un avis client.
     */
    public function deleteReview(Review $review): bool
    {
        return $this->reviewRepository->delete($review);
    }
}
