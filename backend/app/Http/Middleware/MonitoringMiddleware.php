<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\ProductionLogService;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de surveillance des requêtes HTTP (Monitoring Middleware).
 *
 * Mesure la durée de la requête, la mémoire pic, le nombre et la durée des requêtes SQL
 * et la taille de la réponse.
 * Journalise automatiquement les requêtes lentes et ajoute des headers de debug en local.
 */
class MonitoringMiddleware
{
    public function __construct(
        protected ProductionLogService $logger
    ) {}

    /**
     * Traiter une requête entrante.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $monitoringEnabled = config('monitoring.enabled', true);
        if (!$monitoringEnabled) {
            return $next($request);
        }

        $startTime   = microtime(true);
        $startMemory = memory_get_usage(true);

        DB::enableQueryLog();

        $response = $next($request);

        $executionMs  = round((microtime(true) - $startTime) * 1000, 2);
        $memoryPeakMb = round(memory_get_peak_usage(true) / 1024 / 1024, 2);

        $queries = DB::getQueryLog();
        $sqlCount = count($queries);

        $sqlTimeMs = 0.0;
        foreach ($queries as $query) {
            $sqlTimeMs += $query['time'] ?? 0;
        }
        $sqlTimeMs = round($sqlTimeMs, 2);

        DB::disableQueryLog();

        $content = $response->getContent();
        $responseSizeBytes = is_string($content) ? strlen($content) : 0;

        // Journalisation si la requête dépasse le seuil de lenteur
        $slowThresholdMs = config('monitoring.slow_request_threshold', 1000);
        if ($executionMs > $slowThresholdMs) {
            $this->logger->warning("Requête lente détectée ({$executionMs} ms)", [
                'url'            => $request->fullUrl(),
                'method'         => $request->method(),
                'execution_ms'   => $executionMs,
                'threshold_ms'   => $slowThresholdMs,
                'sql_queries'    => $sqlCount,
                'sql_time_ms'    => $sqlTimeMs,
                'memory_peak_mb' => $memoryPeakMb,
                'response_size'  => $responseSizeBytes,
            ]);
        }

        // En environnement local ou non-production, ajouter des en-têtes HTTP de debug
        if (!app()->isProduction()) {
            $response->headers->set('X-Request-Time', $executionMs . 'ms');
            $response->headers->set('X-Memory', $memoryPeakMb . 'MB');
            $response->headers->set('X-SQL-Time', $sqlTimeMs . 'ms');
            $response->headers->set('X-SQL-Queries', (string) $sqlCount);
        }

        return $response;
    }
}
