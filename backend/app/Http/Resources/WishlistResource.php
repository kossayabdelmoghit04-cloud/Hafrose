<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WishlistResource extends JsonResource
{
    /**
     * Transformer le favori en tableau.
     */
    public function toArray(Request $request): array
    {
        $product = $this->product;

        return [
            'id'                 => $this->id,
            'user_id'            => $this->user_id,
            'product'            => new ProductResource($product),
            'category'           => $product ? new CategoryResource($product->category) : null,
            'gallery_principale' => $product ? ($product->image ?: ($product->galleries->first()?->image ?? null)) : null,
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
