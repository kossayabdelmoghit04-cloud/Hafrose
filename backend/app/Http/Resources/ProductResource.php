<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transformer le produit en tableau.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'category_id'       => $this->category_id,
            'category'          => new CategoryResource($this->whenLoaded('category')),
            'name'              => $this->name,
            'slug'              => $this->slug,
            'description'       => $this->description,
            'short_description' => $this->short_description,
            'price'             => $this->price,
            'stock'             => $this->stock,
            'color'             => $this->color,
            'material'          => $this->material,
            'brand'             => $this->brand,
            'image'             => $this->image,
            'is_featured'       => $this->is_featured,
            'galleries'         => GalleryResource::collection($this->whenLoaded('galleries')),
            'reviews'           => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}
