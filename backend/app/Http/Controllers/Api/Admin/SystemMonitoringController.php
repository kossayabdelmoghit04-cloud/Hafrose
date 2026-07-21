<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SystemHealthResource;
use App\Http\Resources\SystemMetricsResource;
use App\Http\Resources\SystemStatusResource;
use App\Http\Resources\PhpInfoResource;
use App\Services\SystemHealthService;
use App\Services\SystemMetricsService;
use App\Services\MonitoringDashboardService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Contrôleur de surveillance et d'observabilité système (Administration HAFROSE).
 *
 * Routes :
 *   GET /api/admin/system/health   → État de santé des composants (Health Check)
 *   GET /api/admin/system/metrics  → Métriques système quantitatives
 *   GET /api/admin/system/status   → Tableau de bord global + alertes actives
 *   GET /api/admin/system/phpinfo  → Informations détaillées sur l'environnement PHP
 *
 * Protégé par : auth:sanctum + admin.
 */
class SystemMonitoringController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected SystemHealthService        $healthService,
        protected SystemMetricsService       $metricsService,
        protected MonitoringDashboardService $dashboardService,
    ) {}

    /**
     * GET /api/admin/system/health
     * État de santé détaillé des services (DB, Cache, Storage, Queue, Scheduler, PHP, Server).
     */
    public function health(Request $request): JsonResponse
    {
        $report = $this->healthService->getHealthReport();
        $resource = new SystemHealthResource($report);

        return $this->successResponse($resource, 'Rapport de santé récupéré avec succès.');
    }

    /**
     * GET /api/admin/system/metrics
     * Métriques quantitatives (CPU, RAM, Disque, DB, Cache, Filesystem, Queue, Scheduler).
     */
    public function metrics(Request $request): JsonResponse
    {
        $metrics = $this->metricsService->getMetrics();
        $resource = new SystemMetricsResource($metrics);

        return $this->successResponse($resource, 'Métriques système récupérées avec succès.');
    }

    /**
     * GET /api/admin/system/status
     * Tableau de bord synthétique du système regroupant Health, Metrics et Alertes actives.
     */
    public function status(Request $request): JsonResponse
    {
        $dashboard = $this->dashboardService->getDashboard();
        $resource = new SystemStatusResource($dashboard);

        return $this->successResponse($resource, 'Statut système récupéré avec succès.');
    }

    /**
     * GET /api/admin/system/phpinfo
     * Détails sur l'environnement d'exécution PHP et extensions chargées.
     */
    public function phpinfo(Request $request): JsonResponse
    {
        $info = [
            'php_version'         => PHP_VERSION,
            'interface'           => PHP_SAPI,
            'memory_limit'        => ini_get('memory_limit'),
            'max_execution_time'  => ini_get('max_execution_time'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size'       => ini_get('post_max_size'),
            'display_errors'      => ini_get('display_errors'),
            'loaded_extensions'   => get_loaded_extensions(),
            'opcache_enabled'     => function_exists('opcache_get_status') && !empty(opcache_get_status(false)),
        ];

        $resource = new PhpInfoResource($info);

        return $this->successResponse($resource, 'Informations PHP récupérées avec succès.');
    }
}
