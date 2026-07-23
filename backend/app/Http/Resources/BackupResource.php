<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Ressource API pour une entrée de sauvegarde.
 *
 * @property string $id
 * @property string $filename
 * @property string $path
 * @property float $size_kb
 * @property string $size_human
 * @property string $created_at
 */
class BackupResource extends JsonResource
{
    /**
     * Transformer la ressource en tableau JSON.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'filename' => $this->resource['filename'],
            'path' => $this->resource['path'],
            'size_kb' => $this->resource['size_kb'],
            'size_human' => $this->resource['size_human'],
            'created_at' => $this->resource['created_at'],
        ];
    }
}
