<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryResource extends JsonResource
{
    /**
     * Transformer l'image de galerie en tableau.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'image' => $this->image,
        ];
    }
}
