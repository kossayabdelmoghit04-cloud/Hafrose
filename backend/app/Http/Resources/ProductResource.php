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
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'is_on_sale' => (bool) $this->is_on_sale,
            'discount_percentage' => $this->discount_percentage,
            'stock' => $this->stock,
            'color' => $this->color,
            'material' => $this->material,
            'brand' => $this->brand,
            'image' => $this->image,
            // URL originale (toujours présente)
            'image_url' => $this->image_url,
            // URL variante carte 480×640 — null si non encore générée
            'image_card_url' => $this->image_card_url,
            // URL variante miniature 120×160 — null si non encore générée
            'image_thumb_url' => $this->image_thumb_url,
            'is_featured' => $this->is_featured,
            'galleries' => GalleryResource::collection($this->whenLoaded('galleries')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
