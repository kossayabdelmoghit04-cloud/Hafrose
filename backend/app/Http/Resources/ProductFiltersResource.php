<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductFiltersResource extends JsonResource
{
    /**
     * Transformer la ressource en tableau.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'categories' => collect($this['categories'])->map(function ($category) {
                return [
                    'id'             => $category->id,
                    'name'           => $category->name,
                    'slug'           => $category->slug,
                    'count'          => (int) $category->products_count,
                    'products_count' => (int) $category->products_count,
                ];
            })->toArray(),
            'price' => [
                'min' => $this['price']['min'] !== null ? (float) $this['price']['min'] : 0,
                'max' => $this['price']['max'] !== null ? (float) $this['price']['max'] : 0,
            ],
            'products_count' => (int) $this['products_count'],
        ];
    }
}
