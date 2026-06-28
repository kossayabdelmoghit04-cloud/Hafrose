<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use HttpResponses;

    protected ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * Obtenir la liste paginée de tous les avis.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $reviews = $this->reviewService->getPaginatedReviews($perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors'  => null,
            'data'    => ReviewResource::collection($reviews),
            'meta'    => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'per_page'     => $reviews->perPage(),
                'total'        => $reviews->total(),
            ],
        ]);
    }

    /**
     * Approuver un avis client.
     */
    public function approve(int $id): JsonResponse
    {
        $review = $this->reviewService->getReviewById($id);
        $updated = $this->reviewService->approveReview($review);

        return $this->successResponse(
            new ReviewResource($updated),
            'Avis approuvé avec succès.'
        );
    }

    /**
     * Rejeter un avis client.
     */
    public function reject(int $id): JsonResponse
    {
        $review = $this->reviewService->getReviewById($id);
        $updated = $this->reviewService->rejectReview($review);

        return $this->successResponse(
            new ReviewResource($updated),
            'Avis rejeté avec succès.'
        );
    }

    /**
     * Supprimer un avis client.
     */
    public function destroy(int $id): JsonResponse
    {
        $review = $this->reviewService->getReviewById($id);
        $this->reviewService->deleteReview($review);

        return $this->successResponse(null, 'Avis supprimé avec succès.');
    }
}
