<?php

namespace App\Services;

/**
 * Service de regroupement du tableau de bord de surveillance (Monitoring Dashboard Service).
 *
 * Aggrège la Santé, les Métriques, le Cache, le Scheduler, la Queue, le Stockage,
 * les Sauvegardes et génère automatiquement les Alertes actives.
 */
class MonitoringDashboardService
{
    public function __construct(
        protected SystemHealthService $healthService,
        protected SystemMetricsService $metricsService,
        protected ProductionLogService $logger
    ) {}

    /**
     * Obtenir l'ensemble des données du tableau de bord de monitoring.
     */
    public function getDashboard(): array
    {
        $health = $this->healthService->getHealthReport();
        $metrics = $this->metricsService->getMetrics();
        $alerts = $this->detectAlerts($health, $metrics);

        return [
            'summary' => [
                'status' => $health['status'],
                'active_alerts' => count($alerts),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => config('app.env'),
                'timestamp' => now()->toIso8601String(),
            ],
            'health' => $health,
            'metrics' => $metrics,
            'cache' => $health['checks']['cache'] ?? [],
            'scheduler' => $health['checks']['scheduler'] ?? [],
            'queue' => $health['checks']['queue'] ?? [],
            'storage' => $health['checks']['filesystem'] ?? [],
            'backups' => $metrics['filesystem'] ?? [],
            'alerts' => $alerts,
        ];
    }

    /**
     * Détecter les alertes du système.
     */
    public function detectAlerts(array $health, array $metrics): array
    {
        $alerts = [];

        try {
            // 1. DB inaccessible
            if (isset($health['checks']['database']['connected']) && ! $health['checks']['database']['connected']) {
                $alert = [
                    'id' => 'db_unreachable',
                    'level' => 'critical',
                    'category' => 'database',
                    'message' => 'La base de données est inaccessible.',
                    'detected_at' => now()->toIso8601String(),
                ];
                $alerts[] = $alert;
                $this->logger->critical($alert['message']);
            }

            // 2. Cache indisponible
            $cacheStatus = $health['checks']['cache']['status'] ?? 'unhealthy';
            if ($cacheStatus !== 'healthy') {
                $alert = [
                    'id' => 'cache_unavailable',
                    'level' => 'error',
                    'category' => 'cache',
                    'message' => 'Le service de cache est indisponible ou dysfonctionnel.',
                    'detected_at' => now()->toIso8601String(),
                ];
                $alerts[] = $alert;
                $this->logger->error($alert['message']);
            }

            // 3. Disque > seuil critique ou warning
            $diskPct = $metrics['disk']['used_percentage'] ?? 0;
            $diskCritical = config('monitoring.disk_critical', 90.0);
            $diskWarning = config('monitoring.disk_warning', 80.0);

            if ($diskPct >= $diskCritical) {
                $alert = [
                    'id' => 'disk_critical',
                    'level' => 'critical',
                    'category' => 'disk',
                    'message' => "L'espace disque a atteint un niveau critique ({$diskPct}% / {$diskCritical}%).",
                    'detected_at' => now()->toIso8601String(),
                ];
                $alerts[] = $alert;
                $this->logger->critical($alert['message']);
            } elseif ($diskPct >= $diskWarning) {
                $alert = [
                    'id' => 'disk_warning',
                    'level' => 'warning',
                    'category' => 'disk',
                    'message' => "L'espace disque a dépassé le seuil d'avertissement ({$diskPct}% / {$diskWarning}%).",
                    'detected_at' => now()->toIso8601String(),
                ];
                $alerts[] = $alert;
                $this->logger->warning($alert['message']);
            }

            // 4. Espace backup insuffisant (ex: espace libre < BACKUP_MIN_DISK_SPACE_MB)
            $minBackupSpaceMb = config('production.backup.min_disk_space_mb', 500);
            $freeDiskMb = isset($metrics['disk']['free_bytes']) && $metrics['disk']['free_bytes'] !== false
                ? round($metrics['disk']['free_bytes'] / 1024 / 1024, 2)
                : null;

            if ($freeDiskMb !== null && $freeDiskMb < $minBackupSpaceMb) {
                $alert = [
                    'id' => 'insufficient_backup_space',
                    'level' => 'warning',
                    'category' => 'backups',
                    'message' => "Espace libre disque ({$freeDiskMb} MB) insuffisant pour les sauvegardes (minimum requis: {$minBackupSpaceMb} MB).",
                    'detected_at' => now()->toIso8601String(),
                ];
                $alerts[] = $alert;
                $this->logger->warning($alert['message']);
            }

            // 5. Mémoire faible
            $memoryAllocatedMb = $metrics['ram']['current_mb'] ?? 0;
            $memoryWarningPct = config('monitoring.memory_warning', 80.0);
            // Si la mémoire actuelle dépasse un seuil arbitraire élevé ou % du max PHP
            $iniLimit = ini_get('memory_limit');
            if ($iniLimit && $iniLimit !== '-1') {
                $limitMb = $this->parseSizeToMb($iniLimit);
                if ($limitMb > 0) {
                    $memoryPct = round(($memoryAllocatedMb / $limitMb) * 100, 2);
                    if ($memoryPct >= $memoryWarningPct) {
                        $alert = [
                            'id' => 'low_memory',
                            'level' => 'warning',
                            'category' => 'memory',
                            'message' => "Utilisation mémoire élevée ({$memoryPct}% de la limite PHP {$iniLimit}).",
                            'detected_at' => now()->toIso8601String(),
                        ];
                        $alerts[] = $alert;
                        $this->logger->warning($alert['message']);
                    }
                }
            }

            // 6. Scheduler inactif
            if (isset($health['checks']['scheduler']['active']) && ! $health['checks']['scheduler']['active']) {
                $alert = [
                    'id' => 'scheduler_inactive',
                    'level' => 'warning',
                    'category' => 'scheduler',
                    'message' => 'Le planificateur de tâches (Scheduler) semble inactif.',
                    'detected_at' => now()->toIso8601String(),
                ];
                $alerts[] = $alert;
                $this->logger->warning($alert['message']);
            }

            // 7. Queue arrêtée / nombre élevé de travaux échoués
            $failedJobs = $metrics['queue']['failed_jobs'] ?? 0;
            if ($failedJobs > 10) {
                $alert = [
                    'id' => 'queue_high_failed_jobs',
                    'level' => 'warning',
                    'category' => 'queue',
                    'message' => "File d'attente : {$failedJobs} travaux ont échoué.",
                    'detected_at' => now()->toIso8601String(),
                ];
                $alerts[] = $alert;
                $this->logger->warning($alert['message']);
            }
        } catch (\Throwable $e) {
            $this->logger->error('Erreur lors de la détection des alertes', ['exception' => $e->getMessage()]);
        }

        return $alerts;
    }

    /**
     * Convertir une taille lisible (ex: 512M, 1G) en Mo.
     */
    protected function parseSizeToMb(string $size): float
    {
        $unit = strtoupper(substr($size, -1));
        $value = (float) substr($size, 0, -1);

        return match ($unit) {
            'G' => $value * 1024,
            'M' => $value,
            'K' => $value / 1024,
            default => (float) $size / 1024 / 1024,
        };
    }
}
