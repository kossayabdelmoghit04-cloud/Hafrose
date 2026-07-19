<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminReviewIndexRequest;
use App\Http\Resources\ReviewResource;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\ReviewService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected ReviewService    $reviewService,
        protected AdminLogService  $adminLogService,
    ) {}

    /**
     * Obtenir la liste paginée de tous les avis.
     */
    public function index(AdminReviewIndexRequest $request): JsonResponse
    {
        $perPage = (int) ($request->validated()['per_page'] ?? 15);
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
    public function approve(Request $request, int $id): JsonResponse
    {
        $review  = $this->reviewService->getReviewById($id);
        $updated = $this->reviewService->approveReview($review);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_APPROVE,
            resource:   AdminLog::RESOURCE_REVIEW,
            resourceId: $review->id,
            oldValues:  ['is_approved' => $review->is_approved],
            newValues:  ['is_approved' => true],
        );

        return $this->successResponse(
            new ReviewResource($updated),
            'Avis approuvé avec succès.'
        );
    }

    /**
     * Rejeter un avis client.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $review  = $this->reviewService->getReviewById($id);
        $updated = $this->reviewService->rejectReview($review);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_REJECT,
            resource:   AdminLog::RESOURCE_REVIEW,
            resourceId: $review->id,
            oldValues:  ['is_approved' => $review->is_approved],
            newValues:  ['is_approved' => false],
        );

        return $this->successResponse(
            new ReviewResource($updated),
            'Avis rejeté avec succès.'
        );
    }

    /**
     * Supprimer un avis client.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $review   = $this->reviewService->getReviewById($id);
        $snapshot = $this->adminLogService->extractModelValues($review, ['id', 'customer_name', 'rating', 'is_approved']);

        $this->reviewService->deleteReview($review);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_DELETE,
            resource:   AdminLog::RESOURCE_REVIEW,
            resourceId: $id,
            oldValues:  $snapshot,
        );

        return $this->successResponse(null, 'Avis supprimé avec succès.');
    }
}
