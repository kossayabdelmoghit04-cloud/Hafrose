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
        $orderNumber = $this->order_number ?: ('HF-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT));
        $subtotal = (float) ($this->subtotal_amount > 0 ? $this->subtotal_amount : $this->total_price);
        $tax = (float) ($this->tax_amount > 0 ? $this->tax_amount : round($subtotal - ($subtotal / 1.2), 2));
        $shipping = (float) ($this->shipping_amount ?? 0.00);
        $total = (float) ($this->total_amount > 0 ? $this->total_amount : ($subtotal + $shipping));

        return [
            'id' => $this->id,
            'order_number' => $orderNumber,
            'user_id' => $this->user_id,
            'customer_name' => $this->customer_name,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code ?? '',
            'country' => $this->country ?? 'France',
            'subtotal_amount' => round($subtotal, 2),
            'tax_amount' => round($tax, 2),
            'shipping_amount' => round($shipping, 2),
            'shipping_method' => $this->shipping_method ?? 'express',
            'payment_method' => $this->payment_method ?? 'card',
            'payment_status' => $this->payment_status ?? 'paid',
            'total_amount' => round($total, 2),
            'total_price' => round($total, 2),
            'status' => $this->status,
            'shipping_address' => [
                'name' => $this->customer_name,
                'address' => $this->address,
                'city' => $this->city,
                'postal_code' => $this->postal_code ?? '',
                'country' => $this->country ?? 'France',
                'phone' => $this->phone,
            ],
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
