<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Ressource API pour le tableau de bord de statut / monitoring global.
 */
class SystemStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $summary = $this->resource['summary'] ?? [];
        $health = $this->resource['health'] ?? [];
        $metrics = $this->resource['metrics'] ?? [];
        $filesystem = $metrics['filesystem'] ?? [];

        return [
            'summary' => [
                'status' => $summary['status'] ?? 'unknown',
                'active_alerts' => $summary['active_alerts'] ?? 0,
                'timestamp' => $summary['timestamp'] ?? null,
            ],
            'health' => ['status' => $health['status'] ?? 'unknown'],
            'metrics' => [
                'cpu' => $metrics['cpu'] ?? [],
                'ram' => $metrics['ram'] ?? [],
                'disk' => $metrics['disk'] ?? [],
            ],
            'cache' => $this->resource['cache'] ?? [],
            'scheduler' => $this->resource['scheduler'] ?? [],
            'queue' => $this->resource['queue'] ?? [],
            'storage' => ['status' => $this->resource['storage']['status'] ?? 'unknown'],
            'backups' => [
                'backup_files_count' => $filesystem['backup_files_count'] ?? 0,
                'backup_total_size_mb' => $filesystem['backup_total_size_mb'] ?? 0,
            ],
            'alerts' => $this->resource['alerts'] ?? [],
        ];
    }
}
