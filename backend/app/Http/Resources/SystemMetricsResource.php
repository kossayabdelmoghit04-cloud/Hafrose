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
        return [
            'cpu' => $this->resource['cpu'] ?? [],
            'ram' => $this->resource['ram'] ?? [],
            'disk' => $this->resource['disk'] ?? [],
            'database' => $this->resource['database'] ?? [],
            'cache' => $this->resource['cache'] ?? [],
            'filesystem' => $this->resource['filesystem'] ?? [],
            'queue' => $this->resource['queue'] ?? [],
            'scheduler' => $this->resource['scheduler'] ?? [],
            'performance' => $this->resource['performance'] ?? [],
        ];
    }
}
