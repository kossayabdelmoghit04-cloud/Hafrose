<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    use HttpResponses;

    protected ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * Obtenir la liste des avis approuvés.
     */
    public function index(): JsonResponse
    {
        $reviews = $this->reviewService->getApprovedReviews();
        return $this->successResponse(ReviewResource::collection($reviews));
    }

    /**
     * Créer un nouvel avis (soumission publique, is_approved = false).
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $review = $this->reviewService->createReview($request->validated());
        
        return $this->successResponse(
            new ReviewResource($review),
            'Avis créé avec succès, en attente d\'approbation.',
            201
        );
    }
}
