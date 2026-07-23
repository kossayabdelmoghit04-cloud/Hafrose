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
        return [
            'summary' => $this->resource['summary'] ?? [],
            'health' => $this->resource['health'] ?? [],
            'metrics' => $this->resource['metrics'] ?? [],
            'cache' => $this->resource['cache'] ?? [],
            'scheduler' => $this->resource['scheduler'] ?? [],
            'queue' => $this->resource['queue'] ?? [],
            'storage' => $this->resource['storage'] ?? [],
            'backups' => $this->resource['backups'] ?? [],
            'alerts' => $this->resource['alerts'] ?? [],
        ];
    }
}
