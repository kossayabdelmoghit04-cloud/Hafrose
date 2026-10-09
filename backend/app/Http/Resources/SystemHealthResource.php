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
        $checks = $this->resource['checks'] ?? [];
        $safeChecks = [];

        foreach ($checks as $name => $check) {
            $safeChecks[$name] = array_filter([
                'status' => $check['status'] ?? 'unknown',
                'connected' => $check['connected'] ?? null,
                'active' => $check['active'] ?? null,
                'enabled' => $check['enabled'] ?? null,
                'response_time_ms' => $check['response_time_ms'] ?? null,
                'pending_jobs' => $check['pending_jobs'] ?? null,
                'failed_jobs' => $check['failed_jobs'] ?? null,
                'stuck_jobs' => $check['stuck_jobs'] ?? null,
                'disk_used_percentage' => $check['disk_used_percentage'] ?? null,
            ], static fn ($value) => $value !== null);

            if ($name === 'filesystem') {
                $safeChecks[$name]['details'] = collect($check['details'] ?? [])->map(
                    static fn (array $detail): array => [
                        'exists' => (bool) ($detail['exists'] ?? false),
                        'writable' => (bool) ($detail['writable'] ?? false),
                        'free_space_mb' => $detail['free_space_mb'] ?? null,
                        'total_space_mb' => $detail['total_space_mb'] ?? null,
                    ]
                )->all();
            }
        }

        $warnings = $this->resource['warnings'] ?? [];
        $errors = $this->resource['errors'] ?? [];

        return [
            'status' => $this->resource['status'] ?? 'unknown',
            'checks' => $safeChecks,
            'warnings' => empty($warnings) ? [] : ['Une ou plusieurs vérifications nécessitent une attention.'],
            'errors' => empty($errors) ? [] : ['Une ou plusieurs vérifications système ont échoué.'],
        ];
    }
}
