<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWishlistRequest extends FormRequest
{
    use HasJsonValidation;

    /**
     * Autoriser cette requête (l'utilisateur doit être authentifié via Sanctum).
     */
    public function authorize(): bool
    {
        return auth('sanctum')->check();
    }

    /**
     * Règles de validation pour l'ajout d'un produit aux favoris.
     * Empêche les doublons pour le même utilisateur.
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
                Rule::unique('wishlist_items')->where(function ($query) {
                    return $query->where('user_id', auth('sanctum')->id() ?: $this->user()?->id);
                }),
            ],
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Le produit est obligatoire.',
            'product_id.integer'  => 'L\'identifiant du produit doit être un entier.',
            'product_id.exists'   => 'Le produit sélectionné n\'existe pas.',
            'product_id.unique'   => 'Ce produit est déjà dans vos favoris.',
        ];
    }
}
