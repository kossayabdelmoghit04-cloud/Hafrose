<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class CurrencyController extends Controller
{
    use HttpResponses;

    protected CurrencyService $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    public function index(): JsonResponse
    {
        return $this->successResponse($this->currencyService->getCurrencies());
    }
}
