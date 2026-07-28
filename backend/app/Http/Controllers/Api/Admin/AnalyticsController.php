<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    use HttpResponses;

    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(): JsonResponse
    {
        return $this->successResponse($this->analyticsService->getBusinessDashboardMetrics());
    }
}
