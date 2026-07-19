<?php

namespace App\Services;

use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Models\Review;
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Collection;

class ReviewService
{
    protected ReviewRepositoryInterface $reviewRepository;
    protected ActivityLogService $activityLogService;

    public function __construct(
        ReviewRepositoryInterface $reviewRepository,
        ActivityLogService $activityLogService
    ) {
        $this->reviewRepository = $reviewRepository;
        $this->activityLogService = $activityLogService;
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
        $review = $this->reviewRepository->create($data);

        // Enregistrer l'activité de soumission d'un avis
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_REVIEW_SUBMITTED,
            category:   ActivityLog::CATEGORY_REVIEW,
            resource:   'reviews',
            resourceId: $review->id,
            metadata:   [
                'customer_name' => $review->customer_name,
                'rating'        => $review->rating,
                'product_id'    => $review->product_id,
            ]
        );

        return $review;
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
        $updatedReview = $this->reviewRepository->update($review, ['is_approved' => true]);

        // Enregistrer l'activité d'approbation d'un avis
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_REVIEW_APPROVED,
            category:   ActivityLog::CATEGORY_REVIEW,
            resource:   'reviews',
            resourceId: $updatedReview->id,
            metadata:   [
                'customer_name' => $updatedReview->customer_name,
                'rating'        => $updatedReview->rating,
            ]
        );

        return $updatedReview;
    }

    /**
     * Désapprouver / Rejeter un avis client.
     */
    public function rejectReview(Review $review): Review
    {
        $updatedReview = $this->reviewRepository->update($review, ['is_approved' => false]);

        // Enregistrer l'activité de rejet d'un avis
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_REVIEW_REJECTED,
            category:   ActivityLog::CATEGORY_REVIEW,
            resource:   'reviews',
            resourceId: $updatedReview->id,
            metadata:   [
                'customer_name' => $updatedReview->customer_name,
                'rating'        => $updatedReview->rating,
            ]
        );

        return $updatedReview;
    }

    /**
     * Supprimer un avis client.
     */
    public function deleteReview(Review $review): bool
    {
        $deleted = $this->reviewRepository->delete($review);

        if ($deleted) {
            // Enregistrer l'activité de suppression d'un avis
            $this->activityLogService->log(
                eventType:  ActivityLog::EVENT_REVIEW_DELETED,
                category:   ActivityLog::CATEGORY_REVIEW,
                resource:   'reviews',
                resourceId: $review->id,
                metadata:   [
                    'customer_name' => $review->customer_name,
                    'rating'        => $review->rating,
                ]
            );
        }

        return $deleted;
    }
}
