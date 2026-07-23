<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Service centralisé de journalisation pour la production et le monitoring.
 *
 * Enrichit automatiquement chaque log avec le contexte d'exécution :
 * timestamp, IP, route, méthode, utilisateur connecté, mémoire et temps d'exécution.
 */
class ProductionLogService
{
    /**
     * Canal de log configuré dans monitoring.php.
     */
    protected string $channel;

    public function __construct()
    {
        $this->channel = config('monitoring.log_channel', 'daily');
    }

    /**
     * Log de niveau CRITICAL.
     */
    public function critical(string $message, array $context = []): void
    {
        $this->writeLog('critical', $message, $context);
    }

    /**
     * Log de niveau ERROR.
     */
    public function error(string $message, array $context = []): void
    {
        $this->writeLog('error', $message, $context);
    }

    /**
     * Log de niveau WARNING.
     */
    public function warning(string $message, array $context = []): void
    {
        $this->writeLog('warning', $message, $context);
    }

    /**
     * Log de niveau INFO.
     */
    public function info(string $message, array $context = []): void
    {
        $this->writeLog('info', $message, $context);
    }

    /**
     * Formater et écrire le log dans le canal approprié.
     */
    protected function writeLog(string $level, string $message, array $context = []): void
    {
        $enrichedContext = $this->buildContext($context);

        try {
            Log::channel($this->channel)->{$level}($message, $enrichedContext);
        } catch (\Throwable $e) {
            // Fallback sur le logger par défaut si le canal spécifique échoue
            Log::{$level}($message, $enrichedContext);
        }
    }

    /**
     * Construire le contexte enrichi avec les métriques d'exécution.
     */
    protected function buildContext(array $context = []): array
    {
        $request = request();
        $isCli = app()->runningInConsole();

        $executionTimeMs = null;
        if (defined('LARAVEL_START')) {
            $executionTimeMs = round((microtime(true) - LARAVEL_START) * 1000, 2);
        }

        $userId = null;
        try {
            if (Auth::check()) {
                $userId = Auth::id();
            }
        } catch (\Throwable $e) {
            $userId = null;
        }

        return array_merge([
            'timestamp' => now()->toIso8601String(),
            'ip' => $isCli ? 'CLI' : ($request ? $request->ip() : null),
            'route' => $isCli ? 'CLI' : ($request ? $request->path() : null),
            'method' => $isCli ? 'CLI' : ($request ? $request->method() : null),
            'user' => $userId,
            'memory' => round(memory_get_peak_usage(true) / 1024 / 1024, 2).' MB',
            'execution_time' => $executionTimeMs ? $executionTimeMs.' ms' : 'N/A',
        ], $context);
    }
}
