<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class PerformanceMonitoringMiddleware
{
    /**
     * Handle an incoming request.
     * Active uniquement en environnement non-production.
     * Ajoute des headers de debug (temps d'exécution, mémoire, requêtes SQL).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isEnabled = config('cache-performance.monitoring.enabled', false);

        if (!$isEnabled || app()->isProduction()) {
            return $next($request);
        }

        $startTime   = microtime(true);
        $startMemory = memory_get_usage(true);

        // Activer le log des requêtes SQL pour les compter
        DB::enableQueryLog();

        $response = $next($request);

        $executionMs  = round((microtime(true) - $startTime) * 1000, 2);
        $memoryPeakMb = round(memory_get_peak_usage(true) / 1024 / 1024, 2);
        $sqlCount     = count(DB::getQueryLog());

        DB::disableQueryLog();
        DB::flushQueryLog();

        // Attacher les métriques dans les headers HTTP (non exposés en prod)
        $response->headers->set('X-Perf-Time-Ms', (string) $executionMs);
        $response->headers->set('X-Perf-Memory-Peak-Mb', (string) $memoryPeakMb);
        $response->headers->set('X-Perf-SQL-Queries', (string) $sqlCount);

        return $response;
    }
}
