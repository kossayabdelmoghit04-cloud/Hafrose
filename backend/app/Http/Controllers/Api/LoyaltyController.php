<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LoyaltyService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    use HttpResponses;

    protected LoyaltyService $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        $this->loyaltyService = $loyaltyService;
    }

    public function account(Request $request): JsonResponse
    {
        $user = $request->user();
        $account = $this->loyaltyService->getAccount($user);

        return $this->successResponse($account);
    }

    public function rewards(): JsonResponse
    {
        $rewards = $this->loyaltyService->getAvailableRewards();

        return $this->successResponse($rewards);
    }
}
