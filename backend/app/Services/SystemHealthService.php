<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

/**
 * Service de contrôle de santé du système (System Health Service).
 *
 * Exécute l'ensemble des vérifications sur l'infrastructure et l'application HAFROSE :
 * Base de données, Cache, Filesystem, Queue, Scheduler, PHP, Serveur et Application.
 */
class SystemHealthService
{
    public function __construct(
        protected ProductionLogService $logger
    ) {}

    /**
     * Obtenir le rapport complet d'état de santé.
     *
     * @return array{status: string, checks: array, warnings: array, errors: array}
     */
    public function getHealthReport(): array
    {
        $warnings = [];
        $errors   = [];

        $dbCheck         = $this->checkDatabase($warnings, $errors);
        $cacheCheck      = $this->checkCache($warnings, $errors);
        $fsCheck         = $this->checkFilesystem($warnings, $errors);
        $queueCheck      = $this->checkQueue($warnings, $errors);
        $schedulerCheck  = $this->checkScheduler($warnings, $errors);
        $phpCheck        = $this->checkPhp($warnings, $errors);
        $serverCheck     = $this->checkServer($warnings, $errors);
        $appCheck        = $this->checkApplication($warnings, $errors);

        $status = 'healthy';
        if (count($errors) > 0) {
            $status = 'unhealthy';
        } elseif (count($warnings) > 0) {
            $status = 'warning';
        }

        return [
            'status'   => $status,
            'checks'   => [
                'database'    => $dbCheck,
                'cache'       => $cacheCheck,
                'filesystem'  => $fsCheck,
                'queue'       => $queueCheck,
                'scheduler'   => $schedulerCheck,
                'php'         => $phpCheck,
                'server'      => $serverCheck,
                'application' => $appCheck,
            ],
            'warnings' => array_values(array_unique($warnings)),
            'errors'   => array_values(array_unique($errors)),
        ];
    }

    /**
     * 1. Vérification Database
     */
    public function checkDatabase(array &$warnings = [], array &$errors = []): array
    {
        $start = microtime(true);
        $connected = false;
        $responseTimeMs = 0;
        $connectionCount = null;
        $driver = config('database.default');
        $databaseName = null;

        try {
            DB::connection()->getPdo();
            $connected = true;

            $queryStart = microtime(true);
            DB::select('SELECT 1');
            $responseTimeMs = round((microtime(true) - $queryStart) * 1000, 2);

            $databaseName = DB::connection()->getDatabaseName();

            // Obtenir le nombre de connexions si MySQL
            if ($driver === 'mysql') {
                try {
                    $result = DB::select("SHOW STATUS LIKE 'Threads_connected'");
                    if (!empty($result)) {
                        $connectionCount = (int) $result[0]->Value;
                    }
                } catch (\Throwable $e) {
                    $connectionCount = null;
                }
            }

            $slowQueryThreshold = config('monitoring.slow_query_threshold', 200);
            if ($responseTimeMs > $slowQueryThreshold) {
                $warnings[] = "Database response time ({$responseTimeMs}ms) exceeds threshold ({$slowQueryThreshold}ms).";
            }
        } catch (\Throwable $e) {
            $errors[] = "Database connection error: " . $e->getMessage();
            $this->logger->error("HealthCheck Database failure", ['exception' => $e->getMessage()]);
        }

        return [
            'status'            => $connected ? 'healthy' : 'unhealthy',
            'driver'            => $driver,
            'database'          => $databaseName,
            'connected'         => $connected,
            'response_time_ms'  => $responseTimeMs,
            'connection_count'  => $connectionCount,
        ];
    }

    /**
     * 2. Vérification Cache
     */
    public function checkCache(array &$warnings = [], array &$errors = []): array
    {
        $store = config('cache.default');
        $testKey = 'health_check_' . uniqid();
        $testValue = 'ok_' . time();
        $writeSuccess = false;
        $readSuccess  = false;
        $deleteSuccess = false;

        try {
            $writeSuccess = Cache::put($testKey, $testValue, 10);
            $retrieved    = Cache::get($testKey);
            $readSuccess  = ($retrieved === $testValue);
            $deleteSuccess = Cache::forget($testKey);
        } catch (\Throwable $e) {
            $errors[] = "Cache operation failure ({$store}): " . $e->getMessage();
            $this->logger->error("HealthCheck Cache failure", ['exception' => $e->getMessage()]);
        }

        $healthy = $writeSuccess && $readSuccess;
        if (!$healthy) {
            $errors[] = "Cache test (put/get/forget) failed for store '{$store}'.";
        }

        return [
            'status'         => $healthy ? 'healthy' : 'unhealthy',
            'store'          => $store,
            'write_success'  => $writeSuccess,
            'read_success'   => $readSuccess,
            'delete_success' => $deleteSuccess,
        ];
    }

    /**
     * 3. Vérification Filesystem (storage, public, backups)
     */
    public function checkFilesystem(array &$warnings = [], array &$errors = []): array
    {
        $backupPath = storage_path('app/' . config('production.backup.path', 'backups'));

        $paths = [
            'storage' => storage_path(),
            'public'  => public_path(),
            'backups' => $backupPath,
        ];

        $details = [];
        $allHealthy = true;

        foreach ($paths as $name => $path) {
            $exists = File::exists($path) || is_dir($path);
            if (!$exists && $name === 'backups') {
                try {
                    File::makeDirectory($path, 0755, true, true);
                    $exists = true;
                } catch (\Throwable $e) {
                    $exists = false;
                }
            }

            $writable = $exists && is_writable($path);
            $freeSpace = $exists ? @disk_free_space($path) : false;
            $totalSpace = $exists ? @disk_total_space($path) : false;

            if (!$exists) {
                $errors[] = "Directory '{$name}' at {$path} does not exist.";
                $allHealthy = false;
            } elseif (!$writable) {
                $errors[] = "Directory '{$name}' at {$path} is not writable.";
                $allHealthy = false;
            }

            $details[$name] = [
                'path'            => $path,
                'exists'          => $exists,
                'writable'        => $writable,
                'free_space_mb'   => $freeSpace !== false ? round($freeSpace / 1024 / 1024, 2) : null,
                'total_space_mb'  => $totalSpace !== false ? round($totalSpace / 1024 / 1024, 2) : null,
            ];
        }

        return [
            'status'  => $allHealthy ? 'healthy' : 'unhealthy',
            'details' => $details,
        ];
    }

    /**
     * 4. Vérification Queue
     */
    public function checkQueue(array &$warnings = [], array &$errors = []): array
    {
        $driver = config('queue.default');
        $active = true;
        $pendingJobs = 0;
        $failedJobs = 0;
        $stuckJobsCount = 0;

        try {
            if (Schema::hasTable('jobs')) {
                $pendingJobs = DB::table('jobs')->count();
                // Jobs créés il y a plus d'une heure non réservés ou bloqués
                $stuckJobsCount = DB::table('jobs')
                    ->where('created_at', '<', now()->subHour()->timestamp)
                    ->count();
            }

            if (Schema::hasTable('failed_jobs')) {
                $failedJobs = DB::table('failed_jobs')->count();
            }

            if ($stuckJobsCount > 0) {
                $warnings[] = "Queue has {$stuckJobsCount} potentially stuck jobs.";
            }

            if ($failedJobs > 10) {
                $warnings[] = "High number of failed queue jobs detected ({$failedJobs}).";
            }
        } catch (\Throwable $e) {
            $warnings[] = "Queue check encountered an error: " . $e->getMessage();
        }

        return [
            'status'         => ($active && $stuckJobsCount === 0) ? 'healthy' : 'warning',
            'driver'         => $driver,
            'active'         => $active,
            'pending_jobs'   => $pendingJobs,
            'failed_jobs'    => $failedJobs,
            'stuck_jobs'     => $stuckJobsCount,
        ];
    }

    /**
     * 5. Vérification Scheduler
     */
    public function checkScheduler(array &$warnings = [], array &$errors = []): array
    {
        $schedulerEnabled = config('monitoring.scheduler_monitoring', true);
        $lastRun = Cache::get('scheduler:last_run');
        $markerFile = storage_path('framework/scheduler_last_run');

        if (!$lastRun && File::exists($markerFile)) {
            $lastRun = date('Y-m-d H:i:s', File::lastModified($markerFile));
        }

        $isActive = true;
        if ($schedulerEnabled && $lastRun) {
            $lastRunTime = strtotime($lastRun);
            // Si le dernier run date de plus de 10 minutes
            if ($lastRunTime && (time() - $lastRunTime) > 600) {
                $isActive = false;
                $warnings[] = "Scheduler appears inactive. Last run was at {$lastRun}.";
            }
        }

        return [
            'status'         => $isActive ? 'healthy' : 'warning',
            'enabled'        => $schedulerEnabled,
            'active'         => $isActive,
            'last_run'       => $lastRun ?: 'Never / Not recorded',
            'next_run_est'   => 'Every minute',
        ];
    }

    /**
     * 6. Vérification PHP
     */
    public function checkPhp(array &$warnings = [], array &$errors = []): array
    {
        $requiredExtensions = ['gd', 'zip', 'pdo', 'openssl'];
        $extensionsStatus = [];
        $missingExt = [];

        foreach ($requiredExtensions as $ext) {
            $loaded = extension_loaded($ext);
            $extensionsStatus[$ext] = $loaded;
            if (!$loaded) {
                $missingExt[] = $ext;
            }
        }

        if (count($missingExt) > 0) {
            $errors[] = "Missing PHP extensions: " . implode(', ', $missingExt);
        }

        return [
            'status'             => empty($missingExt) ? 'healthy' : 'unhealthy',
            'version'            => PHP_VERSION,
            'memory_limit'       => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'extensions'         => $extensionsStatus,
        ];
    }

    /**
     * 7. Vérification Serveur (RAM, CPU, Disk, Uptime, Hostname, OS)
     */
    public function checkServer(array &$warnings = [], array &$errors = []): array
    {
        $freeDisk = @disk_free_space(base_path());
        $totalDisk = @disk_total_space(base_path());
        $usedDisk = ($totalDisk && $freeDisk !== false) ? ($totalDisk - $freeDisk) : 0;
        $diskPercentage = ($totalDisk > 0) ? round(($usedDisk / $totalDisk) * 100, 2) : 0;

        $diskWarningThreshold = config('monitoring.disk_warning', 80.0);
        $diskCriticalThreshold = config('monitoring.disk_critical', 90.0);

        if ($diskPercentage >= $diskCriticalThreshold) {
            $errors[] = "Disk space critical: {$diskPercentage}% used (Threshold: {$diskCriticalThreshold}%).";
        } elseif ($diskPercentage >= $diskWarningThreshold) {
            $warnings[] = "Disk space warning: {$diskPercentage}% used (Threshold: {$diskWarningThreshold}%).";
        }

        // RAM
        $memoryAllocatedMb = round(memory_get_usage(true) / 1024 / 1024, 2);
        $memoryPeakMb = round(memory_get_peak_usage(true) / 1024 / 1024, 2);

        // Load Average (Unix/Linux) ou null sous Windows
        $loadAvg = function_exists('sys_getloadavg') ? @sys_getloadavg() : null;

        // Uptime (optionnel selon OS)
        $uptime = null;
        if (function_exists('exec') && PHP_OS_FAMILY !== 'Windows') {
            try {
                $uptime = @exec('uptime');
            } catch (\Throwable $e) {
                $uptime = null;
            }
        }

        return [
            'status'             => ($diskPercentage >= $diskCriticalThreshold) ? 'unhealthy' : (($diskPercentage >= $diskWarningThreshold) ? 'warning' : 'healthy'),
            'hostname'           => gethostname() ?: 'unknown',
            'os'                 => PHP_OS_FAMILY . ' (' . php_uname('s') . ' ' . php_uname('r') . ')',
            'disk_total_mb'      => $totalSpaceMb = $totalDisk ? round($totalDisk / 1024 / 1024, 2) : null,
            'disk_free_mb'       => $freeDisk !== false ? round($freeDisk / 1024 / 1024, 2) : null,
            'disk_used_percentage' => $diskPercentage,
            'memory_current_mb'  => $memoryAllocatedMb,
            'memory_peak_mb'     => $memoryPeakMb,
            'load_average'       => $loadAvg,
            'uptime'             => $uptime,
        ];
    }

    /**
     * 8. Vérification Application
     */
    public function checkApplication(array &$warnings = [], array &$errors = []): array
    {
        return [
            'status'          => 'healthy',
            'name'            => config('app.name', 'Hafrose'),
            'environment'     => config('app.env', 'production'),
            'debug_mode'      => (bool) config('app.debug', false),
            'app_version'     => config('app.version', '1.0.0'),
            'laravel_version' => app()->version(),
            'timezone'        => config('app.timezone', 'UTC'),
            'locale'          => config('app.locale', 'en'),
        ];
    }
}
