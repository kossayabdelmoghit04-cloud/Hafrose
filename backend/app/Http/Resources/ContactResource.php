<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    /**
     * Transformer le message de contact en tableau.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'subject'    => $this->subject,
            'message'    => $this->message,
            'is_read'    => (bool) $this->is_read,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
