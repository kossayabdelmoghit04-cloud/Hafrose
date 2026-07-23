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
            'php_version' => $this->resource['php_version'] ?? PHP_VERSION,
            'interface' => $this->resource['interface'] ?? PHP_SAPI,
            'memory_limit' => $this->resource['memory_limit'] ?? ini_get('memory_limit'),
            'max_execution_time' => $this->resource['max_execution_time'] ?? ini_get('max_execution_time'),
            'upload_max_filesize' => $this->resource['upload_max_filesize'] ?? ini_get('upload_max_filesize'),
            'post_max_size' => $this->resource['post_max_size'] ?? ini_get('post_max_size'),
            'display_errors' => $this->resource['display_errors'] ?? ini_get('display_errors'),
            'loaded_extensions' => $this->resource['loaded_extensions'] ?? get_loaded_extensions(),
            'opcache_enabled' => $this->resource['opcache_enabled'] ?? (function_exists('opcache_get_status') && ! empty(opcache_get_status(false))),
        ];
    }
}
