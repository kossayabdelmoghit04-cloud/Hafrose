<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * PublicHealthCheckController — Point de terminaison de santé public (non authentifié).
 *
 * Conçu pour les health checks Nginx, Docker, Kubernetes, AWS ALB, et scripts de déploiement.
 * Vérifie l'accessibilité de l'application et de la base de données sans divulguer d'informations sensibles.
 */
class PublicHealthCheckController extends Controller
{
    /**
     * GET /health ou GET /api/health
     */
    public function check(): JsonResponse
    {
        $dbConnected = false;
        try {
            DB::connection()->getPdo();
            $dbConnected = true;
        } catch (\Throwable $e) {
            Log::error('Health check database failure', [
                'message' => $e->getMessage(),
            ]);
        }

        $storageWritable = is_writable(storage_path('framework/cache'));

        $isHealthy = $dbConnected && $storageWritable;

        $payload = [
            'status' => $isHealthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'application' => 'ok',
                'database' => $dbConnected ? 'ok' : 'unreachable',
                'storage' => $storageWritable ? 'ok' : 'unwritable',
            ],
        ];

        return response()->json($payload, $isHealthy ? 200 : 503);
    }
}
