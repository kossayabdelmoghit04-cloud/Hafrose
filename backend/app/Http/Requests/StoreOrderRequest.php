<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    use HasJsonValidation;

    /**
     * Autoriser cette requête (API publique).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la création d'une commande.
     */
    public function rules(): array
    {
        return [
            'customer'           => 'required|string|max:255',
            'phone'              => 'required|string|max:50',
            'address'            => 'required|string|max:500',
            'city'               => 'required|string|max:100',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1|max:999',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'customer.required'           => 'Le nom du client est obligatoire.',
            'customer.string'             => 'Le nom du client doit être une chaîne de caractères.',
            'customer.max'                => 'Le nom du client ne doit pas dépasser 255 caractères.',
            'phone.required'              => 'Le numéro de téléphone est obligatoire.',
            'phone.max'                   => 'Le numéro de téléphone ne doit pas dépasser 50 caractères.',
            'address.required'            => 'L\'adresse de livraison est obligatoire.',
            'address.max'                 => 'L\'adresse ne doit pas dépasser 500 caractères.',
            'city.required'               => 'La ville est obligatoire.',
            'city.max'                    => 'La ville ne doit pas dépasser 100 caractères.',
            'items.required'              => 'Le panier ne peut pas être vide.',
            'items.array'                 => 'Le format des articles est invalide.',
            'items.min'                   => 'Le panier doit contenir au moins un article.',
            'items.*.product_id.required' => 'L\'identifiant du produit est obligatoire.',
            'items.*.product_id.integer'  => 'L\'identifiant du produit doit être un entier.',
            'items.*.product_id.exists'   => 'L\'un des produits sélectionnés n\'existe pas.',
            'items.*.quantity.required'   => 'La quantité est obligatoire.',
            'items.*.quantity.integer'    => 'La quantité doit être un nombre entier.',
            'items.*.quantity.min'        => 'La quantité doit être supérieure ou égale à 1.',
            'items.*.quantity.max'        => 'La quantité ne peut pas dépasser 999 unités par article.',
        ];
    }
}
