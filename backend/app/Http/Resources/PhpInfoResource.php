<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Ressource API pour les informations de l'environnement PHP.
 */
class PhpInfoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'status' => 'available',
            'upload_max_filesize' => $this->resource['upload_max_filesize'] ?? ini_get('upload_max_filesize'),
            'post_max_size' => $this->resource['post_max_size'] ?? ini_get('post_max_size'),
            'opcache_enabled' => $this->resource['opcache_enabled'] ?? (function_exists('opcache_get_status') && ! empty(opcache_get_status(false))),
        ];
    }
}
