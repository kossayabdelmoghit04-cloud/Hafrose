<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Ressource API pour le rapport de santé système.
 */
class SystemHealthResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'status' => $this->resource['status'] ?? 'unknown',
            'checks' => $this->resource['checks'] ?? [],
            'warnings' => $this->resource['warnings'] ?? [],
            'errors' => $this->resource['errors'] ?? [],
        ];
    }
}
