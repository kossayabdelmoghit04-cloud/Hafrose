<?php

namespace App\Http\Resources;

use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AdminLog
 */
class HistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
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
            ] : null,
            'action' => $this->action,
            'resource' => $this->resource,
            'resource_id' => $this->resource_id,
            'description' => $this->description,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
