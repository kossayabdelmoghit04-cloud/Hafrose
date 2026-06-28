<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transformer la commande en tableau.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'customer_name' => $this->customer_name,
            'phone'         => $this->phone,
            'address'       => $this->address,
            'city'          => $this->city,
            'total_price'   => $this->total_price,
            'status'        => $this->status,
            'order_items'   => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}
