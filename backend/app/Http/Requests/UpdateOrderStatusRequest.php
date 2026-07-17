<?php

namespace App\Http\Requests;

use App\Models\Order;
use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    use HasJsonValidation;

    /**
     * Autoriser cette requête (réservée aux administrateurs via middleware).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la mise à jour du statut d'une commande.
     * Les statuts valides sont définis par les constantes du modèle Order.
     */
    public function rules(): array
    {
        $validStatuses = implode(',', [
            Order::STATUS_PENDING,
            Order::STATUS_CONFIRMED,
            Order::STATUS_SHIPPED,
            Order::STATUS_DELIVERED,
            Order::STATUS_CANCELLED,
        ]);

        return [
            'status' => 'required|string|in:' . $validStatuses,
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        $validStatuses = implode(', ', [
            Order::STATUS_PENDING,
            Order::STATUS_CONFIRMED,
            Order::STATUS_SHIPPED,
            Order::STATUS_DELIVERED,
            Order::STATUS_CANCELLED,
        ]);

        return [
            'status.required' => 'Le statut de la commande est obligatoire.',
            'status.string'   => 'Le statut doit être une chaîne de caractères.',
            'status.in'       => "Le statut est invalide. Valeurs autorisées : {$validStatuses}.",
        ];
    }
}
