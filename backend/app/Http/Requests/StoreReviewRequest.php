<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
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
     * Règles de validation pour la création d'un avis client.
     */
    public function rules(): array
    {
        return [
            'product_id'    => 'required|integer|exists:products,id',
            'customer_name' => 'required|string|min:2|max:255',
            'rating'        => 'required|integer|min:1|max:5',
            'comment'       => 'required|string|min:10|max:2000',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'product_id.required'    => 'Le produit est obligatoire.',
            'product_id.integer'     => 'L\'identifiant du produit doit être un entier.',
            'product_id.exists'      => 'Le produit sélectionné n\'existe pas.',
            'customer_name.required' => 'Le nom du client est obligatoire.',
            'customer_name.string'   => 'Le nom du client doit être une chaîne de caractères.',
            'customer_name.min'      => 'Le nom du client doit contenir au moins 2 caractères.',
            'customer_name.max'      => 'Le nom du client ne doit pas dépasser 255 caractères.',
            'rating.required'        => 'La note est obligatoire.',
            'rating.integer'         => 'La note doit être un nombre entier.',
            'rating.min'             => 'La note doit être au minimum de 1.',
            'rating.max'             => 'La note doit être au maximum de 5.',
            'comment.required'       => 'Le commentaire est obligatoire.',
            'comment.string'         => 'Le commentaire doit être une chaîne de caractères.',
            'comment.min'            => 'Le commentaire doit contenir au moins 10 caractères.',
            'comment.max'            => 'Le commentaire ne doit pas dépasser 2000 caractères.',
        ];
    }
}
