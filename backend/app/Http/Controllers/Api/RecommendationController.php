<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\AiRecommendationService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    use HttpResponses;

    protected AiRecommendationService $aiRecommendationService;

    public function __construct(AiRecommendationService $aiRecommendationService)
    {
        $this->aiRecommendationService = $aiRecommendationService;
    }

    public function forYou(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $recommendations = $this->aiRecommendationService->getForYouRecommendations($userId);

        return $this->successResponse(ProductResource::collection($recommendations));
    }

    public function complementary(Product $product): JsonResponse
    {
        $products = $this->aiRecommendationService->getComplementaryProducts($product);

        return $this->successResponse(ProductResource::collection($products));
    }

    public function favorites(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $recommendations = $this->aiRecommendationService->getFavoritesBasedRecommendations($userId);

        return $this->successResponse(ProductResource::collection($recommendations));
    }
}
