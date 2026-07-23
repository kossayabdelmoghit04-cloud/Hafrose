<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardStatsService;
use App\Services\PerformanceCacheManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CacheAdminController extends Controller
{
    public function __construct(
        protected DashboardStatsService $dashboardStatsService
    ) {}

    /**
     * Effacer tout le cache de performance.
     *
     * POST /api/admin/cache/clear
     */
    public function clear(): JsonResponse
    {
        PerformanceCacheManager::clearAll();

        return response()->json([
            'success' => true,
            'message' => 'Cache de performance entièrement vidé.',
            'cleared_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Forcer le rafraîchissement du cache du tableau de bord.
     *
     * POST /api/admin/cache/dashboard/refresh
     */
    public function refreshDashboard(): JsonResponse
    {
        $data = $this->dashboardStatsService->refreshCache();

        return response()->json([
            'success' => true,
            'message' => 'Cache du tableau de bord rafraîchi avec succès.',
            'data' => $data,
        ]);
    }

    /**
     * Obtenir le statut du cache de performance.
     *
     * GET /api/admin/cache/status
     */
    public function status(): JsonResponse
    {
        $driver = config('cache.default');
        $supportsTags = PerformanceCacheManager::supportsTags();

        $keys = [
            'categories_all',
            'products_filters_data',
            'popular_products_list_8',
            'dashboard_metrics',
            'dashboard_sales_chart_15',
            'dashboard_popular_products_5',
            'dashboard_latest_orders_5',
            'dashboard_latest_messages_5',
            'reviews_approved_list_20',
        ];

        $cacheStatus = [];
        foreach ($keys as $key) {
            $cacheStatus[$key] = Cache::has($key) ? 'hit' : 'miss';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'driver' => $driver,
                'supports_tags' => $supportsTags,
                'enabled' => config('cache-performance.enabled', true),
                'ttls' => config('cache-performance.ttls'),
                'monitoring' => config('cache-performance.monitoring.enabled', false),
                'keys_status' => $cacheStatus,
                'checked_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
