<?php

namespace App\Http\Requests;

use App\Models\Order;
use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class AdminOrderIndexRequest extends FormRequest
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
     * Règles de validation pour le listing paginé et filtré des commandes (admin).
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
            'search'   => 'nullable|string|max:255',
            'status'   => 'nullable|string|in:' . $validStatuses,
            'date'     => 'nullable|date_format:Y-m-d',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page'     => 'nullable|integer|min:1',
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
            'search.max'        => 'Le terme de recherche ne doit pas dépasser 255 caractères.',
            'status.in'         => "Le statut est invalide. Valeurs autorisées : {$validStatuses}.",
            'date.date_format'  => 'La date doit être au format AAAA-MM-JJ.',
            'per_page.integer'  => 'Le nombre d\'éléments par page doit être un entier.',
            'per_page.min'      => 'Le nombre d\'éléments par page doit être au moins 1.',
            'per_page.max'      => 'Le nombre d\'éléments par page ne peut pas dépasser 100.',
            'page.integer'      => 'Le numéro de page doit être un entier.',
            'page.min'          => 'Le numéro de page doit être au moins 1.',
        ];
    }
}
