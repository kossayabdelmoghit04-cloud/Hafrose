<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforme une entrée du journal d'activité global en représentation JSON sécurisée.
 *
 * Les métadonnées sont retournées telles quelles : elles ont été sanitisées
 * à l'écriture via ActivityLogService::sanitizeMetadata().
 */
class ActivityLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'event_type'  => $this->event_type,
            'category'    => $this->category,
            'resource'    => $this->getAttribute('resource'),
            'resource_id' => $this->resource_id,
            'metadata'    => $this->metadata,
            'ip_address'  => $this->ip_address,
            'user_agent'  => $this->user_agent,
            'user'        => $this->whenLoaded('user', fn () => $this->user ? [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
                'role'  => $this->user->role,
            ] : null),
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
