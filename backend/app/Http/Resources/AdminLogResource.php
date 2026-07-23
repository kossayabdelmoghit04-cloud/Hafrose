<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminLogResource extends JsonResource
{
    /**
     * Transformer la ressource de log d'administration en tableau JSON.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'admin' => $this->admin ? [
                'id' => $this->admin->id,
                'name' => $this->admin->name,
                'email' => $this->admin->email,
                'role' => $this->admin->role,
            ] : null,
            'admin_id' => $this->admin_id,
            'action' => $this->action,
            'resource' => $this->getAttribute('resource'),
            'resource_type' => $this->getAttribute('resource'),
            'resource_id' => $this->resource_id,
            'description' => $this->description,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'url' => $this->url,
            'method' => $this->method,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
