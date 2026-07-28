<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GiftCardService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GiftCardController extends Controller
{
    use HttpResponses;

    protected GiftCardService $giftCardService;

    public function __construct(GiftCardService $giftCardService)
    {
        $this->giftCardService = $giftCardService;
    }

    public function check(Request $request): JsonResponse
    {
        $code = $request->input('code', '');
        $card = $this->giftCardService->checkCard($code);

        if (!$card) {
            return $this->errorResponse('Carte cadeau invalide ou expirée.', 404);
        }

        return $this->successResponse([
            'code' => $card->code,
            'balance' => $card->current_balance,
            'currency' => $card->currency,
            'expires_at' => $card->expires_at?->toIso8601String(),
        ]);
    }
}
