<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Ressource API pour les métriques système.
 */
class SystemMetricsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $database = $this->resource['database'] ?? [];
        $filesystem = $this->resource['filesystem'] ?? [];

        return [
            'cpu' => $this->resource['cpu'] ?? [],
            'ram' => $this->resource['ram'] ?? [],
            'disk' => $this->resource['disk'] ?? [],
            'database' => [
                'tables_count' => $database['tables_count'] ?? 0,
                'size_mb' => $database['size_mb'] ?? null,
                'query_latency_ms' => $database['query_latency_ms'] ?? null,
            ],
            'cache' => $this->resource['cache'] ?? [],
            'filesystem' => [
                'backup_files_count' => $filesystem['backup_files_count'] ?? 0,
                'backup_total_size_mb' => $filesystem['backup_total_size_mb'] ?? 0,
            ],
            'queue' => $this->resource['queue'] ?? [],
            'scheduler' => $this->resource['scheduler'] ?? [],
            'performance' => $this->resource['performance'] ?? [],
        ];
    }
}
