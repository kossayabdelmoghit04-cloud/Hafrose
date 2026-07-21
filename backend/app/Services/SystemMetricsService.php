<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

/**
 * Service de collecte des métriques système (System Metrics Service).
 *
 * Produit les statistiques quantitatives détaillées pour le CPU, la RAM, le Disque,
 * la Base de données, le Cache, le Filesystem, la Queue, le Scheduler et HTTP.
 */
class SystemMetricsService
{
    public function __construct(
        protected ProductionLogService $logger
    ) {}

    /**
     * Obtenir l'ensemble des métriques système.
     */
    public function getMetrics(): array
    {
        return [
            'cpu'        => $this->getCpuMetrics(),
            'ram'        => $this->getRamMetrics(),
            'disk'       => $this->getDiskMetrics(),
            'database'   => $this->getDatabaseMetrics(),
            'cache'      => $this->getCacheMetrics(),
            'filesystem' => $this->getFilesystemMetrics(),
            'queue'      => $this->getQueueMetrics(),
            'scheduler'  => $this->getSchedulerMetrics(),
            'performance' => $this->getPerformanceMetrics(),
        ];
    }

    /**
     * Métriques CPU
     */
    public function getCpuMetrics(): array
    {
        $loadAvg = function_exists('sys_getloadavg') ? @sys_getloadavg() : null;

        return [
            'load_average' => $loadAvg,
            'load_1min'    => $loadAvg[0] ?? null,
            'load_5min'    => $loadAvg[1] ?? null,
            'load_15min'   => $loadAvg[2] ?? null,
            'cpu_count'    => $this->detectCpuCores(),
        ];
    }

    /**
     * Métriques RAM
     */
    public function getRamMetrics(): array
    {
        $currentBytes = memory_get_usage(true);
        $peakBytes    = memory_get_peak_usage(true);
        $limitStr     = ini_get('memory_limit');

        return [
            'current_bytes'    => $currentBytes,
            'current_mb'       => round($currentBytes / 1024 / 1024, 2),
            'peak_bytes'       => $peakBytes,
            'peak_mb'          => round($peakBytes / 1024 / 1024, 2),
            'ini_memory_limit' => $limitStr,
        ];
    }

    /**
     * Métriques Disque
     */
    public function getDiskMetrics(): array
    {
        $basePath = base_path();
        $freeSpace  = @disk_free_space($basePath);
        $totalSpace = @disk_total_space($basePath);
        $usedSpace  = ($totalSpace && $freeSpace !== false) ? ($totalSpace - $freeSpace) : 0;
        $usedPct    = ($totalSpace > 0) ? round(($usedSpace / $totalSpace) * 100, 2) : 0;

        return [
            'total_bytes'     => $totalSpace,
            'total_gb'        => $totalSpace ? round($totalSpace / 1024 / 1024 / 1024, 2) : null,
            'free_bytes'      => $freeSpace,
            'free_gb'         => $freeSpace !== false ? round($freeSpace / 1024 / 1024 / 1024, 2) : null,
            'used_bytes'      => $usedSpace,
            'used_gb'         => round($usedSpace / 1024 / 1024 / 1024, 2),
            'used_percentage' => $usedPct,
        ];
    }

    /**
     * Métriques Base de Données
     */
    public function getDatabaseMetrics(): array
    {
        $driver = config('database.default');
        $databaseName = null;
        $tableCount = 0;
        $sizeMb = null;
        $queryLatencyMs = 0;

        try {
            $databaseName = DB::connection()->getDatabaseName();

            $start = microtime(true);
            DB::select('SELECT 1');
            $queryLatencyMs = round((microtime(true) - $start) * 1000, 2);

            if ($driver === 'mysql') {
                $tables = DB::select('SHOW TABLES');
                $tableCount = count($tables);

                $sizeResult = DB::select("
                    SELECT SUM(data_length + index_length) / 1024 / 1024 AS size_mb
                    FROM information_schema.TABLES
                    WHERE table_schema = ?
                ", [$databaseName]);

                if (!empty($sizeResult) && isset($sizeResult[0]->size_mb)) {
                    $sizeMb = round((float) $sizeResult[0]->size_mb, 2);
                }
            } elseif ($driver === 'sqlite') {
                $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                $tableCount = count($tables);
                if (file_exists($databaseName)) {
                    $sizeMb = round(filesize($databaseName) / 1024 / 1024, 2);
                }
            }
        } catch (\Throwable $e) {
            $this->logger->warning("Failed to collect database metrics", ['error' => $e->getMessage()]);
        }

        return [
            'driver'           => $driver,
            'database'         => $databaseName,
            'tables_count'     => $tableCount,
            'size_mb'          => $sizeMb,
            'query_latency_ms' => $queryLatencyMs,
        ];
    }

    /**
     * Métriques Cache
     */
    public function getCacheMetrics(): array
    {
        $store = config('cache.default');
        $latencyMs = null;

        try {
            $start = microtime(true);
            Cache::put('metrics_latency_check', '1', 5);
            Cache::get('metrics_latency_check');
            Cache::forget('metrics_latency_check');
            $latencyMs = round((microtime(true) - $start) * 1000, 2);
        } catch (\Throwable $e) {
            $latencyMs = null;
        }

        return [
            'store'      => $store,
            'latency_ms' => $latencyMs,
        ];
    }

    /**
     * Métriques Filesystem
     */
    public function getFilesystemMetrics(): array
    {
        $storagePath = storage_path('app');
        $backupPath  = storage_path('app/' . config('production.backup.path', 'backups'));

        $backupFilesCount = 0;
        $backupTotalSizeMb = 0.0;

        if (File::isDirectory($backupPath)) {
            $files = File::files($backupPath);
            $backupFilesCount = count($files);
            $totalBytes = 0;
            foreach ($files as $file) {
                $totalBytes += $file->getSize();
            }
            $backupTotalSizeMb = round($totalBytes / 1024 / 1024, 2);
        }

        return [
            'storage_path'          => $storagePath,
            'backups_path'          => $backupPath,
            'backup_files_count'    => $backupFilesCount,
            'backup_total_size_mb'  => $backupTotalSizeMb,
        ];
    }

    /**
     * Métriques Queue
     */
    public function getQueueMetrics(): array
    {
        $driver = config('queue.default');
        $pendingJobs = 0;
        $failedJobs = 0;

        try {
            if (Schema::hasTable('jobs')) {
                $pendingJobs = DB::table('jobs')->count();
            }
            if (Schema::hasTable('failed_jobs')) {
                $failedJobs = DB::table('failed_jobs')->count();
            }
        } catch (\Throwable $e) {
            // Silence
        }

        return [
            'driver'       => $driver,
            'pending_jobs' => $pendingJobs,
            'failed_jobs'  => $failedJobs,
        ];
    }

    /**
     * Métriques Scheduler
     */
    public function getSchedulerMetrics(): array
    {
        $lastRun = Cache::get('scheduler:last_run');
        $markerFile = storage_path('framework/scheduler_last_run');

        if (!$lastRun && File::exists($markerFile)) {
            $lastRun = date('Y-m-d H:i:s', File::lastModified($markerFile));
        }

        return [
            'enabled'  => config('monitoring.scheduler_monitoring', true),
            'last_run' => $lastRun ?: null,
        ];
    }

    /**
     * Métriques globales de performance HTTP/SQL & Memory
     */
    public function getPerformanceMetrics(): array
    {
        $requestTimeMs = null;
        if (defined('LARAVEL_START')) {
            $requestTimeMs = round((microtime(true) - LARAVEL_START) * 1000, 2);
        }

        return [
            'current_request_time_ms' => $requestTimeMs,
            'peak_memory_mb'          => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'slow_request_threshold'  => config('monitoring.slow_request_threshold', 1000),
            'slow_query_threshold'    => config('monitoring.slow_query_threshold', 200),
        ];
    }

    /**
     * Détecter le nombre de cœurs CPU
     */
    protected function detectCpuCores(): ?int
    {
        if (PHP_OS_FAMILY === 'Windows') {
            return (int) getenv('NUMBER_OF_PROCESSORS') ?: null;
        }

        if (file_exists('/proc/cpuinfo')) {
            $cpuinfo = file_get_contents('/proc/cpuinfo');
            preg_match_all('/^processor/m', $cpuinfo, $matches);
            return count($matches[0]) ?: null;
        }

        return null;
    }
}
