<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AdminLog;
use App\Services\ActivityLogService;
use App\Services\AdminLogService;
use App\Services\DeploymentHealthService;
use App\Services\DeploymentOptimizationService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Contrôleur d'administration pour l'infrastructure de déploiement & d'optimisation Laravel.
 *
 * Routes :
 *   GET  /api/admin/system/deployment/status   → Statut de santé et état de déploiement
 *   POST /api/admin/system/deployment/optimize → Optimisation complète (config, route, view, event)
 *   POST /api/admin/system/deployment/clear    → Vidage complet des caches
 *   POST /api/admin/system/deployment/warmup   → Préchauffage des caches
 *
 * Toutes les routes sont protégées par : auth:sanctum + admin middleware.
 * Les actions modifiant les caches génèrent des entrées AdminLog et ActivityLog.
 */
class DeploymentController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected DeploymentOptimizationService $optimizationService,
        protected DeploymentHealthService       $healthService,
        protected AdminLogService                $adminLogService,
        protected ActivityLogService             $activityLogService,
    ) {}

    /**
     * GET /api/admin/system/deployment/status
     * Obtenir l'état de santé du déploiement et la configuration de production.
     */
    public function status(Request $request): JsonResponse
    {
        $healthReport = $this->healthService->checkAll();
        $configStatus = config('deployment');

        return $this->successResponse([
            'health' => $healthReport,
            'config' => $configStatus,
        ], 'Statut du déploiement et de santé récupéré avec succès.');
    }

    /**
     * POST /api/admin/system/deployment/optimize
     * Déclencher l'optimisation complète de l'application (config:cache, route:cache, view:cache, event:cache).
     */
    public function optimize(Request $request): JsonResponse
    {
        try {
            $result = $this->optimizationService->optimize();

            // Journalisation AdminLog
            $this->adminLogService->log(
                request:     $request,
                action:      AdminLog::ACTION_DEPLOYMENT_OPTIMIZE,
                resource:    AdminLog::RESOURCE_SYSTEM,
                description: 'Optimisation de déploiement exécutée',
                newValues:   $result,
            );

            // Journalisation ActivityLog
            $this->activityLogService->log(
                eventType:  'deployment.optimize',
                category:   ActivityLog::CATEGORY_ADMIN,
                resource:   AdminLog::RESOURCE_SYSTEM,
                metadata:   $result,
            );

            return $this->successResponse(
                $result,
                $result['message']
            );
        } catch (Throwable $e) {
            return $this->errorResponse(
                "Erreur lors de l'optimisation : " . $e->getMessage(),
                500
            );
        }
    }

    /**
     * POST /api/admin/system/deployment/clear
     * Vider l'ensemble des caches de l'application (config, route, view, event, application).
     */
    public function clear(Request $request): JsonResponse
    {
        try {
            $result = $this->optimizationService->clearCaches();

            // Journalisation AdminLog
            $this->adminLogService->log(
                request:     $request,
                action:      AdminLog::ACTION_DEPLOYMENT_CLEAR,
                resource:    AdminLog::RESOURCE_SYSTEM,
                description: 'Vidage des caches de déploiement exécuté',
                newValues:   $result,
            );

            // Journalisation ActivityLog
            $this->activityLogService->log(
                eventType:  'deployment.clear',
                category:   ActivityLog::CATEGORY_ADMIN,
                resource:   AdminLog::RESOURCE_SYSTEM,
                metadata:   $result,
            );

            return $this->successResponse(
                $result,
                $result['message']
            );
        } catch (Throwable $e) {
            return $this->errorResponse(
                "Erreur lors du vidage des caches : " . $e->getMessage(),
                500
            );
        }
    }

    /**
     * POST /api/admin/system/deployment/warmup
     * Préchauffer l'ensemble des caches de l'application.
     */
    public function warmup(Request $request): JsonResponse
    {
        try {
            $result = $this->optimizationService->warmupCaches();

            // Journalisation AdminLog
            $this->adminLogService->log(
                request:     $request,
                action:      AdminLog::ACTION_DEPLOYMENT_WARMUP,
                resource:    AdminLog::RESOURCE_SYSTEM,
                description: 'Préchauffage des caches de déploiement exécuté',
                newValues:   $result,
            );

            // Journalisation ActivityLog
            $this->activityLogService->log(
                eventType:  'deployment.warmup',
                category:   ActivityLog::CATEGORY_ADMIN,
                resource:   AdminLog::RESOURCE_SYSTEM,
                metadata:   $result,
            );

            return $this->successResponse(
                $result,
                $result['message']
            );
        } catch (Throwable $e) {
            return $this->errorResponse(
                "Erreur lors du préchauffage des caches : " . $e->getMessage(),
                500
            );
        }
    }
}
