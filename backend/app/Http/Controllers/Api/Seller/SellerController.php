<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Services\MarketplaceService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    use HttpResponses;

    protected MarketplaceService $marketplaceService;

    public function __construct(MarketplaceService $marketplaceService)
    {
        $this->marketplaceService = $marketplaceService;
    }

    public function index(): JsonResponse
    {
        return $this->successResponse($this->marketplaceService->getSellers());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $storeName = $request->input('store_name', 'Maison Partenaire');

        $seller = $this->marketplaceService->registerSeller($user, $storeName);

        return $this->successResponse($seller, 'Vendeur enregistré avec succès.', 201);
    }
}
