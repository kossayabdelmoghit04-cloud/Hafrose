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
            DB::select('SELECT 1');
            $dbConnected = true;
        } catch (\Throwable $e) {
            Log::error('Health check database failure', [
                'exception' => $e->getMessage(),
            ]);
        }

        $storageWritable = is_writable(storage_path('framework/cache'));
        $logsWritable = is_dir(storage_path('logs')) && is_writable(storage_path('logs'));

        $cacheOk = true;
        try {
            \Illuminate\Support\Facades\Cache::put('health_ping', 1, 5);
            $cacheOk = (\Illuminate\Support\Facades\Cache::get('health_ping') === 1);
        } catch (\Throwable $e) {
            $cacheOk = false;
        }

        $isHealthy = $dbConnected && $storageWritable && $logsWritable;

        $payload = [
            'status' => $isHealthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'application' => 'ok',
                'database' => $dbConnected ? 'ok' : 'unreachable',
                'storage' => $storageWritable ? 'ok' : 'unwritable',
                'logs' => $logsWritable ? 'ok' : 'unwritable',
                'cache' => $cacheOk ? 'ok' : 'unreachable',
            ],
        ];

        return response()->json($payload, $isHealthy ? 200 : 503);
    }
}
