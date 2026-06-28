<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use HttpResponses;

    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Obtenir toutes les données nécessaires au Dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        $metrics = $this->dashboardService->getMetrics();
        $salesChart = $this->dashboardService->getSalesChartData(15); // 15 derniers jours par défaut
        $popularProducts = $this->dashboardService->getPopularProducts(5);
        $latestOrders = $this->dashboardService->getLatestOrders(5);
        $latestMessages = $this->dashboardService->getLatestMessages(5);

        return $this->successResponse([
            'metrics'          => $metrics,
            'sales_chart'      => $salesChart,
            'popular_products' => $popularProducts,
            'latest_orders'    => $latestOrders,
            'latest_messages'  => $latestMessages,
        ], 'Données du tableau de bord chargées.');
    }
}
