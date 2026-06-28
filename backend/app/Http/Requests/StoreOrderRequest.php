<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreOrderRequest extends FormRequest
{
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
            'customer' => 'required|string|max:255',
            'phone'    => 'required|string|max:50',
            'address'  => 'required|string',
            'city'     => 'required|string|max:100',
            'items'    => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'customer.required' => 'Le nom du client est obligatoire.',
            'phone.required'    => 'Le numéro de téléphone est obligatoire.',
            'address.required'  => 'L\'adresse de livraison est obligatoire.',
            'city.required'     => 'La ville est obligatoire.',
            'items.required'    => 'Le panier ne peut pas être vide.',
            'items.array'       => 'Le format des articles est invalide.',
            'items.min'         => 'Le panier doit contenir au moins un article.',
            'items.*.product_id.required' => 'L\'identifiant du produit est obligatoire.',
            'items.*.product_id.exists'   => 'L\'un des produits sélectionnés n\'existe pas.',
            'items.*.quantity.required'   => 'La quantité est obligatoire.',
            'items.*.quantity.integer'    => 'La quantité doit être un nombre entier.',
            'items.*.quantity.min'        => 'La quantité doit être supérieure ou égale à 1.',
        ];
    }

    /**
     * Gérer l'échec de la validation en retournant un JSON uniforme.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors'  => $validator->errors(),
            'data'    => null,
        ], 422));
    }
}
